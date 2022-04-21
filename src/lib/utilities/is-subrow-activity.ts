export const isSubrowActivity = (event: IterableEvent): boolean => {
  return (
    (event.category === 'command' &&
      event?.attributes?.workflowTaskCompletedEventId) ||
    (event.category === 'workflow' && event?.attributes?.startedEventId)
  );
};
