export const isSubrowActivity = (event: IterableEvent): boolean => {
  return Boolean((event?.attributes as any)?.workflowTaskCompletedEventId);
};
