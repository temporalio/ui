import type { Capabilities } from '$lib/types';

export const nexusEnabled = (capabilities: Capabilities): boolean => {
  return capabilities?.nexus;
};
