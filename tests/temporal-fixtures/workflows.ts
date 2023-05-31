import * as workflow from '@temporalio/workflow';
import type * as activities from '$temporal-fixtures/activities';

const { echoInput } = workflow.proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

const { localEchoInput } = workflow.proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

export async function echoWorkflow(input: string): Promise<string> {
  let result: string;

  const query = workflow.defineQuery('current_result');

  workflow.setHandler(query, () => {
    return result;
  });

  await localEchoInput(input);
  await echoInput(input);

  return result;
}
