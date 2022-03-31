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
        value: event.attributes.workflowType.name ?? '',
      };
    }

    if (event?.attributes?.taskQueue?.name) {
      return {
        key: 'taskQueue.name',
        value: event.attributes.taskQueue.name,
      };
    }

    if (event?.attributes?.signalName) {
      return {
        key: 'signalName',
        value: event.attributes.signalName,
      };
    }

    if (event?.attributes?.requestId) {
      return {
        key: 'requestId',
        value: event.attributes.requestId,
      };
    }

    console.log('EVENT ATTRITUBES: ', event.attributes);

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
