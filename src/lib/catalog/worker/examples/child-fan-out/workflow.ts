import { executeChild, workflowInfo } from '@temporalio/workflow';

export async function childFanOut(
  childCount = 100,
  grandchildCount = 10,
): Promise<number> {
  const { workflowId } = workflowInfo();

  const descendantCounts = await Promise.all(
    Array.from({ length: childCount }, (_, index) =>
      executeChild(childFanOut, {
        args: [grandchildCount, 0],
        workflowId: `${workflowId}-${index + 1}`,
      }),
    ),
  );

  return descendantCounts.reduce((total, count) => total + count, 1);
}
