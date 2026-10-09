import {
  type ActivityOptions,
  allHandlersFinished,
  condition,
  createEventGroup,
  defineQuery,
  defineSignal,
  defineUpdate,
  type EventGroupMarker,
  makeContinueAsNewFunc,
  proxyActivities,
  setHandler,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const activityOptions: ActivityOptions = {
  startToCloseTimeout: '2 minutes',
  heartbeatTimeout: '30 seconds',
  retry: { maximumAttempts: 3 },
};

const {
  streamModelResponse,
  recordApproval,
  requestSteering,
  applySteering,
  compactContext,
} = proxyActivities<typeof activities>(activityOptions);

export type AgentLoopInput = {
  turns: number;
  turnsPerRun: number;
  toolsPerTurn: number;
  streamChunks: number;
  subAgentEvery: number;
  subAgentsPerSpawn: number;
  subAgentTurns: number;
  maxDepth: number;
  steerEvery: number;
  stepDelayMs: number;
};

export type AgentLoopState = {
  depth: number;
  completedTurns: number;
  run: number;
  chunksReceived: number;
  subAgentsStarted: number;
};

export type ResponseChunk = { turn: number; index: number; chunk: string };
export type ToolApproval = { turn: number; tool: string; approver: string };

export const responseChunk = defineSignal<[ResponseChunk]>('responseChunk');
export const approveTool = defineSignal<[ToolApproval]>('approveTool');
export const steer = defineUpdate<string, [string]>('steer');
export const progress = defineQuery<AgentLoopState & { lastChunk?: string }>(
  'progress',
);

const TOOLS = ['search', 'read_file', 'run_tests', 'edit_file', 'fetch_url'];
const TOOLS_REQUIRING_APPROVAL = new Set(['edit_file']);

const initialState: AgentLoopState = {
  depth: 0,
  completedTurns: 0,
  run: 1,
  chunksReceived: 0,
  subAgentsStarted: 0,
};

export async function agentLoop(
  input: AgentLoopInput,
  state: AgentLoopState = initialState,
): Promise<string> {
  const { workflowId } = workflowInfo();
  const agent = state.depth === 0 ? 'Agent' : `Sub-agent L${state.depth}`;
  let chunksReceived = state.chunksReceived;
  let subAgentsStarted = state.subAgentsStarted;
  let lastChunk: string | undefined;
  let instruction: string | undefined;
  const approvals = new Set<string>();

  const toolGroups = new Map<string, EventGroupMarker>();
  const toolGroup = (tool: string) => {
    let group = toolGroups.get(tool);
    if (!group) {
      group = createEventGroup(`Tool: ${tool}`, { id: `tool:${tool}` });
      toolGroups.set(tool, group);
    }
    return group;
  };
  const toolActivities = (tool: string) =>
    proxyActivities<typeof activities>({
      ...activityOptions,
      eventGroups: [toolGroup(tool)],
    });

  setHandler(responseChunk, ({ chunk }) => {
    chunksReceived++;
    lastChunk = chunk;
  });
  setHandler(approveTool, async ({ turn, tool }) => {
    await recordApproval({ tool, turn, delayMs: input.stepDelayMs });
    approvals.add(`${turn}:${tool}`);
  });
  setHandler(steer, async (next) => {
    instruction = await applySteering(next);
    return instruction;
  });
  setHandler(progress, () => ({
    ...state,
    chunksReceived,
    subAgentsStarted,
    lastChunk,
  }));

  const runTool = async (tool: string, turn: number) => {
    const { requestApproval, callTool } = toolActivities(tool);
    if (TOOLS_REQUIRING_APPROVAL.has(tool)) {
      await requestApproval({ tool, turn, delayMs: input.stepDelayMs });
      const approved = await condition(
        () => approvals.has(`${turn}:${tool}`),
        '1 minute',
      );
      if (!approved) return `${tool} skipped for turn ${turn}: not approved`;
    }
    return callTool({ tool, turn, delayMs: input.stepDelayMs });
  };

  let turn = state.completedTurns;
  const runEnd = Math.min(input.turns, turn + input.turnsPerRun);

  while (turn < runEnd) {
    const current = turn + 1;
    const turnGroup = createEventGroup(`Turn ${current}`, {
      id: `turn:${current}`,
    });

    await turnGroup.withScope(async () => {
      if (input.steerEvery > 0 && current % input.steerEvery === 0) {
        await requestSteering(current);
        await condition(() => instruction !== undefined, '1 minute');
      }

      await streamModelResponse({
        agent,
        turn: current,
        chunks: input.streamChunks,
        delayMs: input.stepDelayMs,
        instruction,
      });
      instruction = undefined;

      const work: Promise<unknown>[] = [];

      const tools = createEventGroup(`Tool calls (turn ${current})`, {
        id: `tools:${current}`,
      });
      work.push(
        tools.withScope(() =>
          Promise.all(
            Array.from({ length: input.toolsPerTurn }, (_, index) =>
              runTool(TOOLS[(current + index) % TOOLS.length], current),
            ),
          ),
        ),
      );

      const spawn =
        input.subAgentEvery > 0 &&
        current % input.subAgentEvery === 0 &&
        state.depth < input.maxDepth;
      if (spawn) {
        const depth = state.depth + 1;
        const subAgents = createEventGroup(`Sub-agents (turn ${current})`, {
          id: `sub-agents:${current}`,
        });
        const depthGroup = createEventGroup(`Depth ${depth} sub-agents`, {
          id: `depth:${depth}`,
        });
        work.push(
          subAgents.withScope(async () => {
            const handles = await Promise.all(
              Array.from({ length: input.subAgentsPerSpawn }, (_, index) =>
                startChild(agentLoop, {
                  workflowId: `${workflowId}/t${current}-a${index}`,
                  eventGroups: [depthGroup],
                  args: [
                    {
                      ...input,
                      turns: input.subAgentTurns,
                    },
                    { ...initialState, depth },
                  ],
                }),
              ),
            );
            subAgentsStarted += handles.length;
            return Promise.all(handles.map((handle) => handle.result()));
          }),
        );
      }

      await Promise.all(work);
    });

    turn = current;
  }

  await condition(allHandlersFinished);

  if (turn < input.turns) {
    const handoff = createEventGroup(`Handoff to run ${state.run + 1}`, {
      id: `handoff:${state.run + 1}`,
    });
    await handoff.withScope(() =>
      compactContext({
        agent,
        run: state.run,
        turns: turn,
        chunks: chunksReceived,
      }),
    );
    await makeContinueAsNewFunc<typeof agentLoop>({ eventGroups: [handoff] })(
      input,
      {
        depth: state.depth,
        completedTurns: turn,
        run: state.run + 1,
        chunksReceived,
        subAgentsStarted,
      },
    );
  }

  return `${agent} finished ${turn} turns across ${state.run} run(s), streamed ${chunksReceived} chunks, started ${subAgentsStarted} sub-agent(s)`;
}
