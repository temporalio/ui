// Encode reserved URI characters, \ and %
// TODO: related issue https://github.com/sveltejs/kit/issues/3069
export function encodeURIForSvelte(uri: string): string {
  if (uri) {
    return uri
      .replace(/%/g, '%25')
      .replace(/,/g, '%2C')
      .replace(/\//g, '%2F')
      .replace(/\\/g, '%5C')
      .replace(/\?/g, '%3F')
      .replace(/:/g, '%3A')
      .replace(/@/g, '%40')
      .replace(/&/g, '%26')
      .replace(/=/g, '%3D')
      .replace(/\+/g, '%2B')
      .replace(/\$/g, '%24')
      .replace(/#/g, '%23');
  }
  return uri;
}

// Decodes reserved URI characters, \ and % that are not automatically decoded by svelte kit/vite.
// Note: Using decodeURIComponent is not going to work after vite's decodeURI as it errors on strings like %myworkflowid
// TODO: related issue https://github.com/sveltejs/kit/issues/3069
export function decodeURIForSvelte(uri: string): string {
  if (uri) {
    return uri
      .replace(/%2C/g, ',')
      .replace(/%2F/g, '/')
      .replace(/%5C/g, '\\')
      .replace(/%3F/g, '?')
      .replace(/%3A/g, ':')
      .replace(/%40/g, '@')
      .replace(/%26/g, '&')
      .replace(/%3D/g, '=')
      .replace(/%2B/g, '+')
      .replace(/%24/g, '$')
      .replace(/%23/g, '#')
      .replace(/%25/g, '%');
  }
  return uri;
}
