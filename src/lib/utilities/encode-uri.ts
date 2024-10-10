// Encode reserved URI characters, \ and %
// TODO: related issue https://github.com/sveltejs/kit/issues/3069
export function encodeURIForSvelte(uri: string): string {
  if (uri) return encodeURIComponent(uri);
  return uri;
}

// Decodes reserved URI characters, \ and % that are not automatically decoded by svelte kit/vite.
// Note: Using decodeURIComponent is not going to work after vite's decodeURI as it errors on strings like %myworkflowid
// TODO: related issue https://github.com/sveltejs/kit/issues/3069
export function decodeURIForSvelte(uri: string): string {
  if (uri) return decodeURIComponent(uri);
  return uri;
}
