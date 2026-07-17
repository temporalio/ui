import type { NamespaceCapabilities } from '$lib/types';

import { has } from './has';

type NamespaceCapabilityState = 'unsupported' | 'disabled' | 'enabled';

export const namespaceCapabilityState = (
  capabilities: NamespaceCapabilities | undefined,
  capabilitiy: keyof NonNullable<NamespaceCapabilities>,
): NamespaceCapabilityState => {
  if (!capabilities) return 'unsupported';

  if (!has(capabilities, capabilitiy)) {
    return 'unsupported';
  }

  return capabilities[capabilitiy] ? 'enabled' : 'disabled';
};
