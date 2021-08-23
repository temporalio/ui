export const getTaskQueueUrl = (
  namespace: string,
  taskQueue: string,
) => {
  const url = `/namespaces/${namespace}/queues/${taskQueue}`;

  return url;
};