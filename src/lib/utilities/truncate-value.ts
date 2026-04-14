export const truncateValue = (value: string | undefined | null): string => {
  if (value?.length && value.length > 15) {
    return `${value.slice(0, 7)}...${value.slice(-7)}`;
  }
  return value ?? '';
};
