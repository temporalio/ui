export const TRUNCATE_LENGTH = 15;
const half = Math.floor(TRUNCATE_LENGTH / 2);

export const truncateValue = (value: string | undefined | null): string => {
  if (value?.length && value.length > TRUNCATE_LENGTH) {
    return `${value.slice(0, half)}...${value.slice(-half)}`;
  }
  return value ?? '';
};
