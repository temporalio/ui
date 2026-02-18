<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusCreateEndpoint from '$lib/pages/nexus-create-endpoint.svelte';
  import type { NexusFormData } from '$lib/pages/nexus-form.svelte';
  import { createNexusEndpoint } from '$lib/services/nexus-service';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NetworkError } from '$lib/types/global';
  import type { NexusEndpoint } from '$lib/types/nexus';
  import { encodePayloads } from '$lib/utilities/encode-payload';
  import { routeForNexus } from '$lib/utilities/route-for';
  import { toNexusEndpoint } from '$lib/utilities/to-nexus-endpoint';

  let error = $state<NetworkError | undefined>(undefined);

  const projectId = $derived(
    page.url.searchParams.get('projectId') ?? undefined,
  );

  const onCreate = async (formData: NexusFormData) => {
    try {
      const body: Partial<NexusEndpoint> & { projectId?: string } =
        toNexusEndpoint(formData);

      if (formData.descriptionString) {
        const payloads = await encodePayloads({
          input: JSON.stringify(formData.descriptionString),
          encoding: 'json/plain',
        });
        body.spec!.description = payloads?.[0];
      }

      if (projectId) {
        body.projectId = projectId;
      }

      await createNexusEndpoint(body);
      goto(routeForNexus(), { invalidateAll: true });
    } catch (e) {
      error = e as NetworkError;
      console.error('Error creating endpoint', e);
    }
  };

  const targetNamespaceList = $derived(
    $namespaces.map((namespace) => ({
      namespace: namespace.namespaceInfo?.name ?? '',
    })),
  );
</script>

<PageTitle title={translate('nexus.create-endpoint')} url={page.url.href} />
<div class="flex flex-col gap-4">
  <Link href={routeForNexus()} icon="chevron-left">
    {translate('nexus.back-to-endpoints')}
  </Link>
  <NexusCreateEndpoint {onCreate} {targetNamespaceList} {error} />
</div>
