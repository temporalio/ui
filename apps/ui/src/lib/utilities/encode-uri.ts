export function encodeURIForSvelte(uri: string): string {
  if (uri) return encodeURIComponent(uri);
  return uri;
}

export function decodeURIForSvelte(uri: string): string {
  if (uri) return decodeURIComponent(uri);
  return uri;
}
