export const isSubrowActivity = (event: CommonHistoryEvent): boolean => {
  return Boolean((event?.attributes as any)?.workflowTaskCompletedEventId);
};
