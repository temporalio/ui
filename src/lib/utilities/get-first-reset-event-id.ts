/**
 *
 * @param events an array of WorkflowEvents to search through
 * @returns The id of the first workflow task completed event, or if it doesn't exist then id of the event after task scheduled event.
 */
export const getFirstResetEventID = (events: WorkflowEvent[]): string => {
  for (let i = 0; i <= events.length; i++) {
    const event = events[i];
    if (event.eventType === 'WorkflowTaskCompleted') {
      return event.id;
    } else if (event.eventType === 'WorkflowTaskScheduled') {
      return events[i + 1].id;
    }
  }
};
