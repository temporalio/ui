// A mock function for resolve from $app/paths: https://svelte.dev/docs/kit/$app-paths#resolve
export const resolve = (route: string, params?: Record<string, string>) => {
  if (params) {
    return Object.entries(params).reduce(
      (path, [key, value]) => path.replace(`[${key}]`, value),
      route,
    );
  }
  return route;
};
