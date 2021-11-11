export const getTaskQueueUrl = (
  namespace: string,
  taskQueue: string,
): string => {
  if (!taskQueue) return;
  return `/namespaces/${namespace}/queues/${taskQueue}`;
};
