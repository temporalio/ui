import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { isNotFound } from '$lib/utilities/handle-error';

import type {
  ChainLoadResult,
  ChainResolution,
  ChainRun,
  FirstRunState,
} from './types';

import {
  type ChainContext,
  readStartedEvent,
  toChainError,
} from './chain-context.svelte';

const NO_REDIRECT: ChainLoadResult = { redirectFirstRunId: null };

/**
 * Resolves the route to a chain on load: finds the current Run, checks it
 * belongs to the route's chain (or classifies the mismatch), and describes
 * the first Run for the header.
 */
export class ChainLoader {
  resolution = $state.raw<ChainResolution>({ kind: 'resolving' });
  firstRun = $state.raw<FirstRunState>({ status: 'loading' });

  constructor(
    private readonly _context: ChainContext,
    private readonly _onResolved: (latestRun: ChainRun) => void,
  ) {}

  async load(): Promise<ChainLoadResult> {
    const { firstRunId } = this._context.identity;
    const firstRunTask = this._describeFirstRun();

    let current: WorkflowExecution;
    let currentFirstRunId: string | undefined;
    let startedEvent: HistoryEvent | undefined;
    try {
      current = await this._context.describeCurrent();
      if (this._context.disposed) {
        return NO_REDIRECT;
      }
      currentFirstRunId = current.firstRunId;
      if (!currentFirstRunId || currentFirstRunId === firstRunId) {
        startedEvent = await this._context.fetchStartedEvent(current.runId);
        currentFirstRunId ??=
          readStartedEvent(startedEvent).firstExecutionRunId;
      }
      if (!currentFirstRunId) {
        throw new Error('Missing first Run ID for the current Run.');
      }
    } catch (error) {
      if (this._context.disposed) {
        return NO_REDIRECT;
      }
      this.resolution = { kind: 'failed', error: toChainError(error) };
      return NO_REDIRECT;
    }
    if (this._context.disposed) {
      return NO_REDIRECT;
    }

    if (currentFirstRunId !== firstRunId || !startedEvent) {
      const redirectFirstRunId = await this._classifyMismatch(
        currentFirstRunId,
        await firstRunTask,
      );
      return { redirectFirstRunId };
    }

    this._onResolved(
      this._context.storeRun(current.runId, current, startedEvent),
    );
    this.resolution = { kind: 'resolved' };
    return NO_REDIRECT;
  }

  private async _describeFirstRun(): Promise<FirstRunState> {
    let state: FirstRunState;
    try {
      const workflow = await this._context.describe(
        this._context.identity.firstRunId,
      );
      state = { status: 'found', workflow };
    } catch (error) {
      state = isNotFound(error)
        ? { status: 'notFound' }
        : { status: 'failed', error: toChainError(error) };
    }
    if (!this._context.disposed) {
      this.firstRun = state;
    }
    return state;
  }

  private async _classifyMismatch(
    currentFirstRunId: string,
    firstRun: FirstRunState,
  ): Promise<string | null> {
    if (this._context.disposed) {
      return null;
    }
    const routeRunFirstRunId =
      firstRun.status === 'found'
        ? await this._readFirstRunId(firstRun.workflow)
        : undefined;
    if (this._context.disposed) {
      return null;
    }
    if (
      routeRunFirstRunId &&
      routeRunFirstRunId !== this._context.identity.firstRunId
    ) {
      return routeRunFirstRunId;
    }
    this.resolution = {
      kind: 'mismatch',
      mismatch: {
        reason: routeRunFirstRunId ? 'workflowIdReused' : 'routeChainNotFound',
        currentFirstRunId,
      },
    };
    return null;
  }

  private async _readFirstRunId(
    workflow: WorkflowExecution,
  ): Promise<string | undefined> {
    if (workflow.firstRunId) {
      return workflow.firstRunId;
    }
    try {
      const startedEvent = await this._context.fetchStartedEvent(
        workflow.runId,
      );
      return readStartedEvent(startedEvent).firstExecutionRunId;
    } catch {
      return undefined;
    }
  }
}
