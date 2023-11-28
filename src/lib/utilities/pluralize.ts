export const pluralize = (word: string, count: number): string => {
  if (count === 1) {
    return word;
  }
  if (word.endsWith('y')) {
    return `${word.slice(0, -1)}ies`;
  }
  return `${word}s`;
};
