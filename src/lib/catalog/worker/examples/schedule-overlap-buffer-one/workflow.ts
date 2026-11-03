import { sleep } from '@temporalio/workflow';

export async function scheduleOverlapBufferOne(
  message = 'Buffered run completed',
): Promise<string> {
  await sleep('20 seconds');
  return message;
}
