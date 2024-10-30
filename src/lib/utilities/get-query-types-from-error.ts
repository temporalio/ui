export const getQueryTypesFromError = (message: string): { name: string }[] => {
  const indexOfOpeningBracket = message.indexOf('[');
  const indexOfClosingBracket = message.indexOf(']');

  return message
    .slice(indexOfOpeningBracket + 1, indexOfClosingBracket)
    .split(' ')
    .filter((query: string) => query !== '__stack_trace')
    .map((query: string) => {
      if (query.endsWith(',')) {
        return { name: query.slice(0, query.length - 1) };
      } else {
        return { name: query };
      }
    });
};
