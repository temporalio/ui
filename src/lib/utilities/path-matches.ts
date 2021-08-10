import UrlPattern from 'url-pattern';

const dropQueryParameters = (url: string) => {
  const queryParameterIndex = url.indexOf('?');
  if (queryParameterIndex > -1) return url.slice(0, queryParameterIndex);
  return url;
};

export const pathMatches = (first: string, second: string): boolean => {
  const firstSegments = dropQueryParameters(first).split('/');
  const secondSegments = dropQueryParameters(second).split('/');

  for (let index = 0; index < firstSegments.length; index++) {
    const firstSegment = firstSegments[index];
    const secondSegment = secondSegments[index];

    if (firstSegment !== secondSegment) return false;
  }

  return true;
};

// export const pathMatches = (first: string, second: string) => {
//   const reference = new UrlPattern(first);
//   return !!reference.match(second);
// };
