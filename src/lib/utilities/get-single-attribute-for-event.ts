export const shouldDisplayAttribute = (
  key: string,
  value: unknown,
): boolean => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (value === '0s') return false;
  if (key === 'type') return false;
  return true;
};

const mapObjectToPropertValue = (key: string, value: any) => {
  const firstKey = Object.keys(value)[0];
  return { key: `${key}.${firstKey}`, value: value[firstKey] };
};

export const getSingleAttributeForEvent = ({
  event,
  eventGroup,
}: {
  event: HistoryEventWithId | null;
  eventGroup: CompactEventGroup | null;
}): { key: string; value: string } => {
  let attribute = { key: '', value: '' };

  if (event) {
    const attributes = event?.attributes as any;
    for (const [key, value] of Object.entries(attributes)) {
      if (shouldDisplayAttribute(key, value)) {
        if (typeof value === 'object') {
          attribute = mapObjectToPropertValue(key, value);
        } else {
          attribute = { key, value: value.toString() };
        }
        break;
      }
    }
  }

  if (eventGroup) {
    const attributes = eventGroup?.initialEvent?.attributes as any;
    const input = attributes?.input;
    attribute = { key: 'input', value: input ?? '' };
  }

  return attribute;
};
