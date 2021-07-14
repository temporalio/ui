export const pathMatches = (first: string, second: string): boolean => {
  const firstSegments = first.split('/');
  const secondSegments = second.split('/');

  for (let index = 0; index < firstSegments.length; index++) {
    const firstSegment = firstSegments[index];
    const secondSegment = secondSegments[index];

    if (firstSegment !== secondSegment) return false;
  }

  return true;
};
