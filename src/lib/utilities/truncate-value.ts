export const truncateValue = (value: string | undefined | null): string => {
  if (value?.length && value.length > 13) {
    return `${value.slice(0, 6)}...${value.slice(-6)}`;
  }
  return value ?? '';
};
