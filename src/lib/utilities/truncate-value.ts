export const truncateValue = (value: string): string => {
  if (value.length > 11) {
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }
  return value;
};
