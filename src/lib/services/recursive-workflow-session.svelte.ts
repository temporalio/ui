import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import {
  childEdgeKey,
  childExecutionKey,
  countNodeData,
  DEFAULT_RECURSIVE_TIMELINE_LIMITS,
  executionKey,
  type RecursiveTimelineLimits,
  type TimelineChildEdge,
  type TimelineWorkflowNode,
} from '$lib/components/lines-and-dots/timeline-graph/recursive-timeline-model';
import { getChildWorkflowReference } from '$lib/components/lines-and-dots/timeline-graph/timeline-child-reference';
import {
  getSuccessorFromEvents,
  materializeTimelineGroup,
  type TimelineRun,
} from '$lib/services/chain-workflow-session';
import type { WorkflowExecution } from '$lib/types/workflows';
import { routeForApi } from '$lib/utilities/route-for-api';

import {
  ChildWorkflowLoadError,
  describeChildWorkflow,
  loadChildWorkflow,
  type LoadedChildWorkflow,
} from './child-workflow-loader';
import { runLivePoll } from './live-poll';

type Loader = typeof loadChildWorkflow;
type Describer = typeof describeChildWorkflow;
type LivePoller = typeof runLivePoll;

type Reservation = {
  nodes: number;
  runs: number;
  groups: number;
  events: number;
};

type QueueTask = {
  key: string;
  reference: TimelineChildEdge['reference'];
  edges: Set<TimelineChildEdge>;
  reservation: Reservation;
  controller: AbortController;
  loadLimits: { maximumEvents: number; maximumGroups: number };
  refresh: boolean;
  previousNode?: TimelineWorkflowNode;
  mergePreviousRuns?: boolean;
  awaitingReservation?: boolean;
};

type DescribeTask = {
  key: string;
  reference: TimelineChildEdge['reference'];
  edges: Set<TimelineChildEdge>;
  controller: AbortController;
};

const emptyReservation = (): Reservation => ({
  nodes: 0,
  runs: 0,
  groups: 0,
  events: 0,
});

const executionStateFromWorkflow = (
  workflow: WorkflowExecution,
): NonNullable<TimelineChildEdge['execution']> => {
  const endTimeMs = workflow.endTime ? Date.parse(workflow.endTime) : undefined;
  return {
    status: workflow.status,
    active: workflow.isRunning || workflow.isPaused,
    endTimeMs: Number.isFinite(endTimeMs) ? endTimeMs : undefined,
  };
};

const executionStateFromRun = (
  run: TimelineRun,
): NonNullable<TimelineChildEdge['execution']> => ({
  status: run.status,
  active: run.active,
  endTimeMs: run.active ? undefined : run.endTimeMs,
});

export class RecursiveWorkflowSession {
  private revision = $state(0);
  private rootNode: TimelineWorkflowNode;
  private readonly limits: RecursiveTimelineLimits;
  private readonly loader: Loader;
  private readonly describer: Describer;
  private readonly queued: QueueTask[] = [];
  private readonly queuedDescriptions: DescribeTask[] = [];
  private readonly tasksByExecutionKey = new SvelteMap<string, QueueTask>();
  private readonly descriptionsByExecutionKey = new SvelteMap<
    string,
    DescribeTask
  >();
  private readonly loadedByExecutionKey = new SvelteMap<
    string,
    TimelineWorkflowNode
  >();
  private readonly visibleEdgeKeys = new SvelteSet<string>();
  private retained: Reservation = emptyReservation();
  private reserved: Reservation = emptyReservation();
  private activeRequests = 0;
  private disposed = false;
  private paused = false;
  private readonly livePoller: LivePoller;
  private readonly initialExpansion: (
    depth: number,
  ) => TimelineChildEdge['expansion'];
  private readonly livePollsByExecutionKey = new SvelteMap<
    string,
    { controller: AbortController; edges: Set<TimelineChildEdge> }
  >();
  readonly counters = {
    topologyRequests: 0,
    topologyResolutions: 0,
    topologyTruncations: 0,
    scrollAttributedRequests: 0,
  };

  constructor({
    namespace,
    workflow,
    runs,
    limits = DEFAULT_RECURSIVE_TIMELINE_LIMITS,
    loader = loadChildWorkflow,
    describer = describeChildWorkflow,
    livePoller = runLivePoll,
    initialExpansion = () => 'expanded',
  }: {
    namespace: string;
    workflow: WorkflowExecution;
    runs: TimelineRun[];
    limits?: RecursiveTimelineLimits;
    loader?: Loader;
    describer?: Describer;
    livePoller?: LivePoller;
    /** Whether a child found at this depth starts open; the root is depth 0. */
    initialExpansion?: (depth: number) => TimelineChildEdge['expansion'];
  }) {
    this.initialExpansion = initialExpansion;
    this.limits = limits;
    this.loader = loader;
    this.describer = describer;
    this.livePoller = livePoller;
    this.rootNode = this.createNode({ namespace, workflow, runs, depth: 0 });
    this.resolveTopology();
  }

  get snapshot(): TimelineWorkflowNode {
    void this.revision;
    return { ...this.rootNode };
  }

  get requestCount(): number {
    void this.revision;
    return this.activeRequests;
  }

  syncRoot({
    namespace,
    workflow,
    runs,
  }: {
    namespace: string;
    workflow: WorkflowExecution;
    runs: TimelineRun[];
  }): void {
    if (this.disposed) return;
    const nextKey = executionKey({
      namespace,
      workflowId: workflow.id,
      firstRunId: workflow.firstExecutionRunId ?? workflow.runId,
    });
    if (nextKey !== this.rootNode.key) {
      this.dispose();
      return;
    }
    this.rootNode.workflow = workflow;
    this.rootNode.runs = runs;
    this.discoverEdges(this.rootNode);
    this.rebuildLoadedIndex();
    this.pruneUnreachableTasks();
    this.resolveTopology();
    this.changed();
    this.drain();
  }

  observeEdges(edgeKeys: Iterable<string>): void {
    if (this.disposed) return;
    const now = Date.now();
    let changed = false;
    const keys = [...edgeKeys];
    this.visibleEdgeKeys.clear();
    for (const key of keys) this.visibleEdgeKeys.add(key);
    for (const key of keys) {
      const found = this.findEdge(key);
      if (!found) continue;
      found.edge.lastVisibleAt = now;
      if (
        found.edge.expansion === 'expanded' &&
        (found.edge.load.state === 'idle' ||
          found.edge.load.state === 'evicted')
      ) {
        this.enqueue(found.edge, found.ancestry);
        changed = true;
      }
      if (found.edge.load.state === 'truncated' && !found.edge.execution) {
        this.enqueueDescription(found.edge);
        changed = true;
      }
    }
    if (changed) {
      this.changed();
      this.drain();
    }
  }

  resolveTopology(): void {
    if (this.disposed) return;
    const visit = (node: TimelineWorkflowNode, ancestry: string[]): void => {
      const nextAncestry = [...ancestry, node.key];
      for (const edge of node.childrenByGroupKey.values()) {
        if (
          edge.expansion === 'expanded' &&
          (edge.load.state === 'idle' || edge.load.state === 'evicted')
        ) {
          this.enqueue(edge, nextAncestry);
        }
        if (edge.load.state === 'loaded' && !edge.load.truncation) {
          visit(edge.load.node, nextAncestry);
        }
      }
    };
    visit(this.rootNode, []);
    this.drain();
  }

  toggle(edgeKey: string): void {
    const found = this.findEdge(edgeKey);
    if (!found) return;
    found.edge.expansion =
      found.edge.expansion === 'expanded' ? 'collapsed' : 'expanded';
    if (
      found.edge.expansion === 'expanded' &&
      (found.edge.load.state === 'idle' || found.edge.load.state === 'evicted')
    ) {
      this.enqueue(found.edge, found.ancestry, true);
    }
    this.changed();
  }

  load(edgeKey: string): void {
    const found = this.findEdge(edgeKey);
    if (
      !found ||
      (found.edge.load.state !== 'idle' && found.edge.load.state !== 'evicted')
    ) {
      return;
    }
    this.enqueue(found.edge, found.ancestry, true);
    this.changed();
  }

  /**
   * Loads a folded child's history without opening it, so its row can say
   * what it holds. Unlike a load the user asks for, it never evicts others.
   */
  preload(edgeKey: string): void {
    const found = this.findEdge(edgeKey);
    if (!found || found.edge.load.state !== 'idle') return;
    this.enqueue(found.edge, found.ancestry);
    this.changed();
  }

  retry(edgeKey: string): void {
    const found = this.findEdge(edgeKey);
    if (!found || found.edge.load.state === 'loading') return;
    found.edge.load = { state: 'idle' };
    found.edge.expansion = 'expanded';
    this.enqueue(found.edge, found.ancestry);
    this.changed();
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    if (paused) {
      for (const task of this.tasksByExecutionKey.values()) {
        if (task.refresh) task.controller.abort();
      }
    }
    this.changed();
  }

  evict(edgeKey: string): void {
    const found = this.findEdge(edgeKey);
    if (!found || found.edge.load.state !== 'loaded') return;
    found.edge.load = { state: 'evicted' };
    this.rebuildLoadedIndex();
    this.changed();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const poll of this.livePollsByExecutionKey.values()) {
      poll.controller.abort();
    }
    this.livePollsByExecutionKey.clear();
    for (const task of this.tasksByExecutionKey.values()) {
      task.controller.abort();
      for (const edge of task.edges) {
        if (edge.load.state === 'loading') edge.load = { state: 'idle' };
      }
    }
    for (const task of this.descriptionsByExecutionKey.values()) {
      task.controller.abort();
    }
    this.queued.length = 0;
    this.queuedDescriptions.length = 0;
    this.tasksByExecutionKey.clear();
    this.descriptionsByExecutionKey.clear();
    this.reserved = emptyReservation();
    this.changed();
  }

  private createNode({
    namespace,
    workflow,
    runs,
    depth,
  }: {
    namespace: string;
    workflow: WorkflowExecution;
    runs: TimelineRun[];
    depth: number;
  }): TimelineWorkflowNode {
    const node: TimelineWorkflowNode = {
      key: executionKey({
        namespace,
        workflowId: workflow.id,
        firstRunId: workflow.firstExecutionRunId ?? workflow.runId,
      }),
      namespace,
      workflowId: workflow.id,
      firstRunId: workflow.firstExecutionRunId ?? workflow.runId,
      workflow,
      runs,
      childrenByGroupKey: new SvelteMap(),
      depth,
    };
    this.discoverEdges(node);
    return node;
  }

  private discoverEdges(node: TimelineWorkflowNode): void {
    const previous = node.childrenByGroupKey;
    const next = new SvelteMap<string, TimelineChildEdge>();
    for (const run of node.runs) {
      for (const entry of run.topologyGroups ?? run.groups) {
        // Event groups from the application are categorized. Keep accepting
        // uncategorized groups for lightweight callers and test fixtures.
        if (
          entry.group.category !== undefined &&
          entry.group.category !== 'child-workflow'
        ) {
          continue;
        }
        const reference = getChildWorkflowReference(
          entry.group,
          node.namespace,
        );
        if (!reference) continue;
        const prior = previous.get(entry.timelineKey);
        next.set(
          entry.timelineKey,
          prior ?? {
            key: childEdgeKey({
              parentExecutionKey: node.key,
              parentGroupKey: entry.timelineKey,
              childExecutionKey: childExecutionKey(reference),
            }),
            parentGroupKey: entry.timelineKey,
            reference,
            expansion: this.initialExpansion(node.depth + 1),
            load: { state: 'idle' },
            depth: node.depth + 1,
            lastVisibleAt: 0,
          },
        );
      }
    }
    node.childrenByGroupKey = next;
  }

  private findEdge(
    key: string,
  ): { edge: TimelineChildEdge; ancestry: string[] } | null {
    const visit = (
      node: TimelineWorkflowNode,
      ancestry: string[],
    ): { edge: TimelineChildEdge; ancestry: string[] } | null => {
      for (const edge of node.childrenByGroupKey.values()) {
        if (edge.key === key)
          return { edge, ancestry: [...ancestry, node.key] };
        if (edge.load.state === 'loaded') {
          const found = visit(edge.load.node, [...ancestry, node.key]);
          if (found) return found;
        }
      }
      return null;
    };
    return visit(this.rootNode, []);
  }

  private enqueue(
    edge: TimelineChildEdge,
    ancestry: string[],
    userInitiated = false,
  ): void {
    const targetKey = childExecutionKey(edge.reference);
    if (ancestry.includes(targetKey)) {
      edge.load = { state: 'truncated', truncation: { reason: 'cycle' } };
      this.counters.topologyTruncations += 1;
      return;
    }
    if (edge.depth > this.limits.maximumDepth) {
      edge.load = {
        state: 'truncated',
        truncation: { reason: 'depth-limit' },
      };
      this.counters.topologyTruncations += 1;
      this.enqueueDescription(edge);
      return;
    }
    const loaded = this.loadedByExecutionKey.get(targetKey);
    if (loaded) {
      edge.load = { state: 'loaded', node: loaded };
      const run = loaded.runs.find(
        (candidate) => candidate.runId === edge.reference.runId,
      );
      edge.execution = run
        ? executionStateFromRun(run)
        : executionStateFromWorkflow(loaded.workflow);
      return;
    }
    const existing = this.tasksByExecutionKey.get(targetKey);
    if (existing) {
      existing.edges.add(edge);
      edge.load = { state: 'loading', requestKey: targetKey };
      return;
    }

    let reservation = this.reserve();
    if (!reservation && userInitiated) {
      while (this.evictLeastRecentlyUsed(edge, ancestry)) {
        reservation = this.reserve();
        if (reservation) break;
      }
    }
    const waitingForCapacity = this.queued.filter(
      (task) => task.awaitingReservation,
    ).length;
    const canWaitForCapacity =
      !reservation &&
      this.activeRequests >= this.limits.maximumConcurrentRequests &&
      this.retained.nodes + this.reserved.nodes + waitingForCapacity <
        this.limits.maximumNodes - 1 &&
      this.retained.runs + waitingForCapacity <
        this.limits.maximumDescendantRuns &&
      this.retained.groups + waitingForCapacity <
        this.limits.maximumDescendantGroups &&
      this.retained.events + waitingForCapacity <
        this.limits.maximumDescendantEvents;
    if (!reservation && !canWaitForCapacity) {
      edge.expansion = 'collapsed';
      edge.load = { state: 'idle' };
      this.counters.topologyTruncations += 1;
      this.enqueueDescription(edge);
      return;
    }
    reservation ??= emptyReservation();
    const task: QueueTask = {
      key: targetKey,
      reference: edge.reference,
      edges: new SvelteSet([edge]),
      reservation,
      controller: new AbortController(),
      loadLimits: {
        maximumEvents: reservation.events,
        maximumGroups: reservation.groups,
      },
      refresh: false,
      awaitingReservation: canWaitForCapacity,
    };
    edge.load = { state: 'loading', requestKey: targetKey };
    this.tasksByExecutionKey.set(targetKey, task);
    this.queued.push(task);
    this.counters.topologyRequests += 1;
    this.drain();
  }

  private evictLeastRecentlyUsed(
    target: TimelineChildEdge,
    ancestry: string[],
  ): boolean {
    const candidates: TimelineChildEdge[] = [];
    const visit = (node: TimelineWorkflowNode): void => {
      for (const edge of node.childrenByGroupKey.values()) {
        if (edge.load.state !== 'loaded') continue;
        if (edge !== target && !ancestry.includes(edge.load.node.key)) {
          candidates.push(edge);
        }
        visit(edge.load.node);
      }
    };
    visit(this.rootNode);
    candidates.sort(
      (left, right) =>
        Number(this.visibleEdgeKeys.has(left.key)) -
          Number(this.visibleEdgeKeys.has(right.key)) ||
        right.depth - left.depth ||
        Number(left.expansion === 'expanded') -
          Number(right.expansion === 'expanded') ||
        left.lastVisibleAt - right.lastVisibleAt,
    );
    const victim = candidates[0];
    if (!victim) return false;
    victim.expansion = 'collapsed';
    victim.load = { state: 'evicted' };
    this.rebuildLoadedIndex();
    return true;
  }

  private reserve(): Reservation | null {
    const available = {
      nodes:
        this.limits.maximumNodes -
        1 -
        this.retained.nodes -
        this.reserved.nodes,
      runs:
        this.limits.maximumDescendantRuns -
        this.retained.runs -
        this.reserved.runs,
      groups:
        this.limits.maximumDescendantGroups -
        this.retained.groups -
        this.reserved.groups,
      events:
        this.limits.maximumDescendantEvents -
        this.retained.events -
        this.reserved.events,
    };
    if (
      available.nodes < 1 ||
      available.runs < 1 ||
      available.groups < 1 ||
      available.events < 1
    ) {
      return null;
    }
    const reservation = {
      nodes: 1,
      runs: Math.min(this.limits.maximumRunsPerNode, available.runs),
      groups: Math.min(this.limits.maximumGroupsPerNode, available.groups),
      events: Math.min(this.limits.maximumEventsPerNode, available.events),
    };
    this.add(this.reserved, reservation);
    return reservation;
  }

  private drain(): void {
    while (
      !this.disposed &&
      this.activeRequests < this.limits.maximumConcurrentRequests &&
      (this.queued.length || this.queuedDescriptions.length)
    ) {
      const task = this.queued[0];
      if (task?.awaitingReservation) {
        const reservation = this.reserve();
        if (reservation) {
          task.reservation = reservation;
          task.loadLimits = {
            maximumEvents: reservation.events,
            maximumGroups: reservation.groups,
          };
          task.awaitingReservation = false;
        } else {
          if (this.activeRequests === 0) {
            this.cancelTask(task);
            for (const edge of task.edges) {
              edge.expansion = 'collapsed';
              this.counters.topologyTruncations += 1;
              this.queueDescription(edge);
            }
            continue;
          }
          const description = this.queuedDescriptions.shift();
          if (!description) return;
          this.activeRequests += 1;
          void this.runDescription(description);
          continue;
        }
      }
      if (task) {
        this.queued.shift();
        this.activeRequests += 1;
        void this.runTask(task);
        continue;
      }
      const description = this.queuedDescriptions.shift();
      if (!description) return;
      this.activeRequests += 1;
      void this.runDescription(description);
    }
    this.changed();
  }

  private enqueueDescription(edge: TimelineChildEdge): void {
    this.queueDescription(edge);
    this.drain();
  }

  private queueDescription(edge: TimelineChildEdge): void {
    if (edge.execution) return;
    const key = childExecutionKey(edge.reference);
    const existing = this.descriptionsByExecutionKey.get(key);
    if (existing) {
      existing.edges.add(edge);
      return;
    }
    const task: DescribeTask = {
      key,
      reference: edge.reference,
      edges: new SvelteSet([edge]),
      controller: new AbortController(),
    };
    this.descriptionsByExecutionKey.set(key, task);
    this.queuedDescriptions.push(task);
  }

  private async runDescription(task: DescribeTask): Promise<void> {
    try {
      const workflow = await this.describer({
        reference: task.reference,
        signal: task.controller.signal,
      });
      if (this.disposed || task.controller.signal.aborted) return;
      const execution = executionStateFromWorkflow(workflow);
      for (const edge of task.edges) edge.execution = execution;
    } catch {
      // The history safety-limit state remains useful when Describe is also
      // unavailable. Expansion/retry continues to own user-facing errors.
    } finally {
      if (this.descriptionsByExecutionKey.get(task.key) === task) {
        this.descriptionsByExecutionKey.delete(task.key);
      }
      this.activeRequests -= 1;
      this.changed();
      this.drain();
    }
  }

  private async runTask(task: QueueTask): Promise<void> {
    let committed = false;
    try {
      const result = await this.loader({
        reference: task.reference,
        signal: task.controller.signal,
        limits: {
          maximumEvents: task.loadLimits.maximumEvents,
          maximumGroups: task.loadLimits.maximumGroups,
        },
      });
      if (this.disposed || task.controller.signal.aborted) return;
      this.commitLoaded(task, result);
      this.counters.topologyResolutions += 1;
      committed = true;
    } catch (error) {
      if (this.disposed) return;
      if (task.controller.signal.aborted) {
        for (const edge of task.edges) this.resetLoadingEdge(task, edge);
        return;
      }
      const classified =
        error instanceof ChildWorkflowLoadError
          ? error
          : new ChildWorkflowLoadError(
              'network',
              error instanceof Error
                ? error.message
                : 'Unable to load child workflow',
            );
      if (!task.refresh) {
        for (const edge of task.edges) {
          edge.load = {
            state: 'error',
            kind: classified.kind,
            reason: classified.message,
            retryable: classified.retryable,
          };
        }
      }
    } finally {
      this.subtract(this.reserved, task.reservation);
      if (this.tasksByExecutionKey.get(task.key) === task) {
        this.tasksByExecutionKey.delete(task.key);
      }
      this.activeRequests -= 1;
      if (committed) this.enqueueKnownSuccessors(task);
      if (committed) this.resolveTopology();
      this.changed();
      this.drain();
    }
  }

  private commitLoaded(task: QueueTask, result: LoadedChildWorkflow): void {
    const mergedRuns = task.previousNode
      ? task.mergePreviousRuns
        ? [...task.previousNode.runs, result.run]
        : task.previousNode.runs.some((run) => run.runId === result.run.runId)
          ? task.previousNode.runs.map((run) =>
              run.runId === result.run.runId ? result.run : run,
            )
          : [...task.previousNode.runs, result.run]
      : [result.run];
    const runTruncated = mergedRuns.length > this.limits.maximumRunsPerNode;
    const runs = mergedRuns.slice(-this.limits.maximumRunsPerNode);
    let depth = Number.POSITIVE_INFINITY;
    for (const edge of task.edges) {
      if (edge.depth < depth) depth = edge.depth;
    }
    let node = task.previousNode;
    if (node) {
      node.workflow = result.workflow;
      node.runs = runs;
      node.depth = depth;
      this.discoverEdges(node);
    } else {
      node = this.createNode({
        namespace: task.reference.namespace,
        workflow: result.workflow,
        runs,
        depth,
      });
    }
    for (const edge of task.edges) {
      edge.execution = executionStateFromWorkflow(result.workflow);
      edge.load = {
        state: 'loaded',
        node,
        truncation: runTruncated ? { reason: 'run-limit' } : result.truncation,
      };
    }
    this.rebuildLoadedIndex();
  }

  private rebuildLoadedIndex(): void {
    const aliases = new SvelteMap<string, TimelineWorkflowNode>();
    const visited = new SvelteSet<TimelineWorkflowNode>();
    const retained = emptyReservation();
    const visit = (node: TimelineWorkflowNode): void => {
      if (visited.has(node)) return;
      visited.add(node);
      if (node !== this.rootNode) {
        const data = countNodeData(node);
        this.add(retained, { nodes: 1, ...data });
        aliases.set(node.key, node);
        for (const run of node.runs) {
          aliases.set(
            childExecutionKey({
              namespace: node.namespace,
              workflowId: node.workflowId,
              runId: run.runId,
            }),
            node,
          );
        }
      }
      for (const edge of node.childrenByGroupKey.values()) {
        if (edge.load.state !== 'loaded') continue;
        aliases.set(childExecutionKey(edge.reference), edge.load.node);
        visit(edge.load.node);
      }
    };
    visit(this.rootNode);
    this.loadedByExecutionKey.clear();
    for (const [key, node] of aliases) {
      this.loadedByExecutionKey.set(key, node);
    }
    this.retained = retained;
  }

  private pruneUnreachableTasks(): void {
    const reachableEdges = new SvelteSet<TimelineChildEdge>();
    const visit = (node: TimelineWorkflowNode): void => {
      for (const edge of node.childrenByGroupKey.values()) {
        reachableEdges.add(edge);
        if (edge.load.state === 'loaded') visit(edge.load.node);
      }
    };
    visit(this.rootNode);

    for (const task of [...this.tasksByExecutionKey.values()]) {
      for (const edge of [...task.edges]) {
        if (!reachableEdges.has(edge)) {
          this.resetLoadingEdge(task, edge);
          task.edges.delete(edge);
        }
      }
      if (task.edges.size) continue;
      this.cancelTask(task);
    }
    for (const task of [...this.descriptionsByExecutionKey.values()]) {
      for (const edge of [...task.edges]) {
        if (!reachableEdges.has(edge)) task.edges.delete(edge);
      }
      if (task.edges.size) continue;
      task.controller.abort();
      const queuedIndex = this.queuedDescriptions.indexOf(task);
      if (queuedIndex >= 0) this.queuedDescriptions.splice(queuedIndex, 1);
      if (this.descriptionsByExecutionKey.get(task.key) === task) {
        this.descriptionsByExecutionKey.delete(task.key);
      }
    }
  }

  private cancelTask(task: QueueTask): void {
    for (const edge of task.edges) this.resetLoadingEdge(task, edge);
    task.controller.abort();
    const queuedIndex = this.queued.indexOf(task);
    if (queuedIndex >= 0) this.queued.splice(queuedIndex, 1);
    if (this.tasksByExecutionKey.get(task.key) === task) {
      this.tasksByExecutionKey.delete(task.key);
    }
    this.subtract(this.reserved, task.reservation);
    task.reservation = emptyReservation();
    task.awaitingReservation = false;
  }

  private resetLoadingEdge(task: QueueTask, edge: TimelineChildEdge): void {
    if (
      !task.refresh &&
      edge.load.state === 'loading' &&
      edge.load.requestKey === task.key
    ) {
      edge.load = { state: 'idle' };
    }
  }

  private enqueueKnownSuccessors(task: QueueTask): void {
    for (const edge of task.edges) {
      if (edge.expansion !== 'expanded' || edge.load.state !== 'loaded') {
        continue;
      }
      const child = edge.load.node;
      const finalRun = [...child.runs]
        .sort((a, b) => a.startTimeMs - b.startTimeMs)
        .at(-1);
      const successorRunId =
        finalRun?.successorRunId ??
        (finalRun
          ? getSuccessorFromEvents(
              finalRun.groups.flatMap(
                (entry) => materializeTimelineGroup(entry).eventList,
              ),
            )?.runId
          : undefined);
      if (
        successorRunId &&
        !child.runs.some((run) => run.runId === successorRunId)
      ) {
        this.enqueueRefresh(
          edge,
          child,
          { ...edge.reference, runId: successorRunId },
          true,
        );
      }
    }
  }

  private enqueueRefresh(
    edge: TimelineChildEdge,
    previousNode: TimelineWorkflowNode,
    reference: TimelineChildEdge['reference'],
    mergePreviousRuns = false,
  ): void {
    const key = childExecutionKey(reference);
    const existing = this.tasksByExecutionKey.get(key);
    if (existing) {
      existing.edges.add(edge);
      return;
    }
    const previous = countNodeData(previousNode);
    const maximumEvents = Math.min(
      this.limits.maximumEventsPerNode,
      this.limits.maximumDescendantEvents -
        this.retained.events -
        this.reserved.events +
        previous.events,
    );
    const maximumGroups = Math.min(
      this.limits.maximumGroupsPerNode,
      this.limits.maximumDescendantGroups -
        this.retained.groups -
        this.reserved.groups +
        previous.groups,
    );
    if (maximumEvents < 1 || maximumGroups < 1) return;
    const reservation: Reservation = {
      nodes: 0,
      runs: 0,
      groups: Math.max(0, maximumGroups - previous.groups),
      events: Math.max(0, maximumEvents - previous.events),
    };
    this.add(this.reserved, reservation);
    const task: QueueTask = {
      key,
      reference,
      edges: new SvelteSet([edge]),
      reservation,
      controller: new AbortController(),
      loadLimits: { maximumEvents, maximumGroups },
      refresh: true,
      previousNode,
      mergePreviousRuns,
    };
    this.tasksByExecutionKey.set(key, task);
    this.queued.push(task);
    this.drain();
  }

  private reconcileLivePolls(): void {
    if (this.disposed || this.paused) {
      for (const [key, poll] of this.livePollsByExecutionKey) {
        this.livePollsByExecutionKey.delete(key);
        poll.controller.abort();
      }
      return;
    }

    const desired = new SvelteMap<
      string,
      {
        reference: TimelineChildEdge['reference'];
        run: TimelineRun;
        edges: Set<TimelineChildEdge>;
      }
    >();
    const visit = (node: TimelineWorkflowNode): void => {
      for (const edge of node.childrenByGroupKey.values()) {
        if (edge.expansion !== 'expanded' || edge.load.state !== 'loaded') {
          continue;
        }
        const child = edge.load.node;
        const finalRun = [...child.runs]
          .sort((a, b) => a.startTimeMs - b.startTimeMs)
          .at(-1);
        if (
          finalRun?.active &&
          (finalRun.status === 'Running' || finalRun.status === 'Paused')
        ) {
          const reference = { ...edge.reference, runId: finalRun.runId };
          const key = childExecutionKey(reference);
          const existing = desired.get(key);
          if (existing) {
            existing.edges.add(edge);
          } else {
            desired.set(key, {
              reference,
              run: finalRun,
              edges: new SvelteSet([edge]),
            });
          }
        }
        visit(child);
      }
    };
    visit(this.rootNode);

    for (const [key, poll] of this.livePollsByExecutionKey) {
      const target = desired.get(key);
      if (target) {
        poll.edges.clear();
        for (const edge of target.edges) poll.edges.add(edge);
        continue;
      }
      this.livePollsByExecutionKey.delete(key);
      poll.controller.abort();
    }

    for (const [key, target] of desired) {
      if (this.livePollsByExecutionKey.has(key)) continue;
      this.startChildLivePoll(key, target);
    }
  }

  private startChildLivePoll(
    key: string,
    target: {
      reference: TimelineChildEdge['reference'];
      run: TimelineRun;
      edges: Set<TimelineChildEdge>;
    },
  ): void {
    const controller = new AbortController();
    const seenEventIds = new SvelteSet(
      target.run.groups.flatMap((entry) =>
        materializeTimelineGroup(entry).eventList.map((event) => event.id),
      ),
    );
    this.livePollsByExecutionKey.set(key, {
      controller,
      edges: target.edges,
    });
    void this.livePoller({
      route: routeForApi('events.ascending', {
        namespace: target.reference.namespace,
        workflowId: target.reference.workflowId,
      }),
      runId: target.reference.runId,
      startToken: '',
      signal: controller.signal,
      onEvent: (event) => {
        if (seenEventIds.has(event.eventId)) return false;
        seenEventIds.add(event.eventId);
        return true;
      },
      onNewEvents: () => {
        for (const edge of target.edges) {
          if (edge.expansion !== 'expanded' || edge.load.state !== 'loaded') {
            continue;
          }
          const child = edge.load.node;
          if (!child.runs.some((run) => run.runId === target.run.runId)) {
            continue;
          }
          this.enqueueRefresh(edge, child, target.reference);
        }
      },
    })
      .catch(() => undefined)
      .finally(() => {
        const current = this.livePollsByExecutionKey.get(key);
        if (current?.controller !== controller) return;
        this.livePollsByExecutionKey.delete(key);
        this.reconcileLivePolls();
      });
  }

  private add(target: Reservation, value: Reservation): void {
    target.nodes += value.nodes;
    target.runs += value.runs;
    target.groups += value.groups;
    target.events += value.events;
  }

  private subtract(target: Reservation, value: Reservation): void {
    target.nodes = Math.max(0, target.nodes - value.nodes);
    target.runs = Math.max(0, target.runs - value.runs);
    target.groups = Math.max(0, target.groups - value.groups);
    target.events = Math.max(0, target.events - value.events);
  }

  private changed(): void {
    this.revision += 1;
    this.reconcileLivePolls();
  }
}
