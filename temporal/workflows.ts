import * as workflow from '@temporalio/workflow';
import type * as activities from './activities';

const { echo: Activity, sideEffect: SideEffect } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

const { echo: LocalActivity } = workflow.proxyLocalActivities<
  typeof activities
>({
  startToCloseTimeout: '10 seconds',
});

export async function Workflow(input: string): Promise<string> {
  await SideEffect(input);
  await LocalActivity(input);
  return Activity(input);
}
