export const getLastEvent = ({
  events,
}: CompactEventGroup): HistoryEventWithId => {
  let latestEventKey = 0;
  let result: HistoryEventWithId;

  for (const event of events.values()) {
    const k = Number(event.id);
    if (k >= latestEventKey) {
      latestEventKey = k;
      result = event;
    }
  }

  return result;
};
