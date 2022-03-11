export function getEnvironment(): string {
  return import.meta.env.VITE_TEMPORAL_UI_BUILD_TARGET ?? 'local';
}
