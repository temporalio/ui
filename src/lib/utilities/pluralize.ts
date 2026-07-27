/**
 * @deprecated Prefer to use pluralization through i18ln
 * @param word
 * @param count
 * @returns
 */
export const pluralize = (word: string, count: number): string => {
  if (count === 1) {
    return word;
  }
  return `${word}s`;
};
