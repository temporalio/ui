import type { NexusFormData } from '$lib/pages/nexus-form.svelte';
import type { NexusEndpoint } from '$lib/types/nexus';

/**
 * Transforms flat form data to nested NexusEndpoint structure
 */
export function toNexusEndpoint(
  formData: NexusFormData,
): Partial<NexusEndpoint> {
  return {
    spec: {
      name: formData.name,
      // Note: description is handled separately via encodePayloads in the page components
      target: {
        worker: {
          namespace: formData.targetNamespace,
          taskQueue: formData.taskQueue,
        },
      },
      // Only include allowedCallerNamespaces if provided (cloud-only feature)
      allowedCallerNamespaces:
        formData.allowedCallerNamespaces?.length > 0
          ? formData.allowedCallerNamespaces
          : undefined,
    },
  };
}
