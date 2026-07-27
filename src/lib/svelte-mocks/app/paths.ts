export const base = '/temporal';

// A mock function for resolve from $app/paths: https://svelte.dev/docs/kit/$app-paths#resolve
export const resolve = (route: string, params?: Record<string, string>) => {
  let resolved = route;
  if (params) {
    resolved = Object.entries(params).reduce(
      (path, [key, value]) => path.replace(`[${key}]`, value),
      resolved,
    );
  }
  return `${base}${resolved}`;
};
