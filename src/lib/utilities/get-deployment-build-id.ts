export const getBuildIdFromVersion = (version: string | undefined): string => {
  if (!version) return '';
  const newDelimiter = version.split(':')[1];
  if (newDelimiter) return newDelimiter;
  const oldDelimiter = version.split('.')[1];
  if (oldDelimiter) return oldDelimiter;
  return '';
};
