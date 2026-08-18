export async function signalActivity(
  workflowId: string,
  signalName: string,
  signalValue: unknown,
): Promise<string> {
  return `Signal received by workflow ${workflowId} with signal ${signalName} and value ${JSON.stringify(signalValue)}`;
}
