import type { NexusFormData } from '$lib/pages/nexus-form.svelte';
import type { NexusEndpoint } from '$lib/types/nexus';
import { encodePayloads } from '$lib/utilities/encode-payload';

export async function getNexusEndpoint(
  formData: NexusFormData,
): Promise<Partial<NexusEndpoint>> {
  const endpoint: Partial<NexusEndpoint> = {
    spec: {
      name: formData.name,
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

  if (formData.descriptionString) {
    const payloads = await encodePayloads({
      input: JSON.stringify(formData.descriptionString),
      encoding: 'json/plain',
    });
    endpoint.spec!.description = payloads?.[0];
  }

  return endpoint;
}
