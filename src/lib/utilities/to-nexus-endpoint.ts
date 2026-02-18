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
      descriptionString: formData.descriptionString,
      target: {
        worker: {
          namespace: formData.targetNamespace,
          taskQueue: formData.taskQueue,
        },
      },
      allowedCallerNamespaces: formData.allowedCallerNamespaces,
    },
  };
}
