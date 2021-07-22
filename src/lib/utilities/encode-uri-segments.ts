/**
 * Encodes segments of a URL, but respects "/" and "?".
 * Like `encodeURIComponent` this will encode the "#" when using a hash.
 * `decodeURIComponent` will translate the output back to its original form.
 *
 * @param uri string
 * @returns string
 */
export const encodeURISegments = (uri: string) => {
  const queryParameterIndex = uri.indexOf('?');

  return (
    uri
      .slice(0, queryParameterIndex)
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/') + uri.slice(queryParameterIndex)
  );
};
