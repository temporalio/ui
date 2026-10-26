const patternLabels: Readonly<Record<string, string>> = {
  'batch-processing': 'Batch Processing',
};

const sentenceCase = (slug: string) => {
  const words = slug.replaceAll('-', ' ').trim();
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
};

export const patternLabel = (pattern: string): string =>
  Object.hasOwn(patternLabels, pattern)
    ? patternLabels[pattern]
    : sentenceCase(pattern);
