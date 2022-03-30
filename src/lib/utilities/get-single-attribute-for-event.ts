export const getSingleAttributeForEvent = ({
  event,
  eventGroup,
}: {
  event: HistoryEventWithId | null;
  eventGroup: CompactEventGroup | null;
}) => {
  if (event) {
    if (event?.attributes?.workflowType?.name) {
      return {
        key: 'workflowType.name',
        value: event?.attributes?.workflowType?.name ?? '',
      };
    }
    return { key: 'lorum', value: 'ipsum' };
  }

  if (eventGroup) {
    return {
      key: 'input',
      value: eventGroup?.initialEvent?.attributes?.input ?? '',
    };
  }

  return { key: '', value: '' };
};
