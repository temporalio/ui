export const getTaskQueueUrl = (
  namespace: string,
  taskQueue: string,
): string => {
  const url = `/namespaces/${namespace}/queues/${taskQueue}`;

  return url;
};
