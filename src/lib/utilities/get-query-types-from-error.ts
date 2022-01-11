export const getQueryTypesFromError = (message: string): string[] => {
  const indexOfOpeningBracket = message.indexOf('[');
  const indexOfClosingBracket = message.indexOf(']');

  return message
    .slice(indexOfOpeningBracket + 1, indexOfClosingBracket)
    .split(' ')
    .filter((query) => query !== '__stack_trace');
};
