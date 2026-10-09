import { Context } from '@temporalio/activity';
import { WorkflowUpdateStage } from '@temporalio/client';

export type StreamRequest = {
  agent: string;
  turn: number;
  chunks: number;
  delayMs: number;
  instruction?: string;
};

export type ToolCall = {
  tool: string;
  turn: number;
  delayMs: number;
};

export type ContextSummary = {
  agent: string;
  run: number;
  turns: number;
  chunks: number;
};

const WORDS = [
  'Considering',
  'the',
  'tool',
  'output,',
  'the',
  'next',
  'step',
  'is',
  'to',
  'refine',
  'the',
  'plan',
  'and',
  'continue.',
];

const ownWorkflowHandle = () => {
  const { workflowExecution } = Context.current().info;
  if (!workflowExecution) {
    throw new Error('Agent loop activities must run in a workflow');
  }
  return Context.current().client.workflow.getHandle(
    workflowExecution.workflowId,
    workflowExecution.runId,
  );
};

export async function streamModelResponse({
  agent,
  turn,
  chunks,
  delayMs,
  instruction,
}: StreamRequest): Promise<string> {
  const handle = ownWorkflowHandle();
  const parts: string[] = [];
  for (let index = 0; index < chunks; index++) {
    await Context.current().sleep(delayMs);
    const chunk = WORDS[(turn + index) % WORDS.length];
    parts.push(chunk);
    Context.current().heartbeat(index);
    await handle.signal('responseChunk', { turn, index, chunk });
  }
  const steering = instruction ? ` (steered: ${instruction})` : '';
  return `${agent} turn ${turn}${steering}: ${parts.join(' ')}`;
}

export async function callTool({
  tool,
  turn,
  delayMs,
}: ToolCall): Promise<string> {
  await Context.current().sleep(delayMs);
  return `${tool} finished for turn ${turn}`;
}

export async function requestApproval({
  tool,
  turn,
  delayMs,
}: ToolCall): Promise<void> {
  await Context.current().sleep(delayMs);
  await ownWorkflowHandle().signal('approveTool', {
    tool,
    turn,
    approver: 'reviewer',
  });
}

export async function recordApproval({
  tool,
  turn,
  delayMs,
}: ToolCall): Promise<string> {
  await Context.current().sleep(delayMs);
  return `${tool} approved for turn ${turn}`;
}

export async function requestSteering(turn: number): Promise<void> {
  await ownWorkflowHandle().startUpdate('steer', {
    args: [`Focus on failing tests before turn ${turn + 1}`],
    updateId: `steer-t${turn}`,
    waitForStage: WorkflowUpdateStage.ACCEPTED,
  });
}

export async function applySteering(instruction: string): Promise<string> {
  await Context.current().sleep(50);
  return instruction;
}

export async function compactContext({
  agent,
  run,
  turns,
  chunks,
}: ContextSummary): Promise<string> {
  await Context.current().sleep(100);
  return `${agent} run ${run}: compacted ${turns} turns and ${chunks} chunks`;
}
