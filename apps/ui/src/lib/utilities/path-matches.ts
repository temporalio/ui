const dropQueryParameters = (url: string) => {
  const queryParameterIndex = url?.indexOf('?');
  if (queryParameterIndex > -1) return url.slice(0, queryParameterIndex);
  return url;
};

export const pathMatches = (
  first: string,
  second: string,
  exactMatch = false,
): boolean => {
  const firstSegments = dropQueryParameters(first).split('/');
  const secondSegments = dropQueryParameters(second).split('/');

  if (exactMatch && firstSegments.length !== secondSegments.length) {
    return false;
  }

  for (let index = 0; index < firstSegments.length; index++) {
    const firstSegment = firstSegments[index];
    const secondSegment = secondSegments[index];

    if (firstSegment !== secondSegment) return false;
  }

  return true;
};
