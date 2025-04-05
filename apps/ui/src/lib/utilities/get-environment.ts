export function getEnvironment(): string | null {
  return import.meta.env.VITE_TEMPORAL_UI_BUILD_TARGET ?? null;
}
