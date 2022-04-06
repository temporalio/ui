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

export const shouldDisplayAsWorkflowLink = (key: string) => {
  if (!key) return false;

  if (key.toLowerCase().endsWith('runid')) {
    return true;
  }

  return false;
};

const mapObjectToPropertValue = (key: string, value: any) => {
  const firstKey = Object.keys(value)[0];
  return { key: `${key}.${firstKey}`, value: value[firstKey] };
};

const getFirstDisplayAttribute = (attributes: any) => {
  if (!attributes) return;
  for (const [key, value] of Object.entries(attributes)) {
    if (shouldDisplayAttribute(key, value)) {
      if (typeof value === 'object') {
        return mapObjectToPropertValue(key, value);
      } else {
        return { key, value: value.toString() };
      }
    }
  }
};

export const getSingleAttributeForEvent = ({
  event,
  eventGroup,
}: {
  event: HistoryEventWithId | null;
  eventGroup: CompactEventGroup | null;
}): { key: string; value: string } => {
  if (eventGroup) {
    const attributes = eventGroup?.initialEvent?.attributes as any;
    const input = attributes?.input ?? '';
    return { key: 'input', value: input };
  }

  return getFirstDisplayAttribute(event?.attributes) ?? { key: '', value: '' };
};
