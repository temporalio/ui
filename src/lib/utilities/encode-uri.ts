export function encodeURIForSvelte(uri: string): string {
  try {
    if (uri) return encodeURIComponent(uri);
    return uri;
  } catch {
    return uri;
  }
}

export function decodeURIForSvelte(uri: string): string {
  try {
    if (uri) return decodeURIComponent(uri);
    return uri;
  } catch {
    return uri;
  }
}
