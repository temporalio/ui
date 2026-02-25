<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEditEndpoint from '$lib/pages/nexus-edit-endpoint.svelte';
  import type { NexusFormData } from '$lib/pages/nexus-form.svelte';
  import {
    deleteNexusEndpoint,
    updateNexusEndpoint,
  } from '$lib/services/nexus-service';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NexusEndpoint } from '$lib/types/nexus';
  import { getNexusEndpoint } from '$lib/utilities/get-nexus-endpoint';
  import {
    routeForNexus,
    routeForNexusEndpoint,
  } from '$lib/utilities/route-for';

  import type { LayoutData } from '../$types';

  let { data }: { data: LayoutData } = $props();

  const { endpoint } = $derived(data);

  let loading = $state(false);

  const onUpdate = async (formData: NexusFormData) => {
    if (!endpoint?.id) return;

    loading = true;

    try {
      const body: Partial<NexusEndpoint> = {
        ...(await getNexusEndpoint(formData)),
        id: endpoint.id,
        version: endpoint.version,
      };

      await updateNexusEndpoint(endpoint.id, body);
      await goto(routeForNexusEndpoint(endpoint.id), { invalidateAll: true });
    } catch (e: unknown) {
      console.error('Error updating endpoint', e);
      throw e;
    } finally {
      loading = false;
    }
  };

  const onDelete = async () => {
    if (!endpoint?.id) return;

    loading = true;
    try {
      await deleteNexusEndpoint(endpoint.id, String(endpoint.version));
      await goto(routeForNexus());
    } catch (e) {
      console.error('Error deleting endpoint', e);
      throw e;
    } finally {
      loading = false;
    }
  };

  const targetNamespaceList = $derived(
    $namespaces.map((namespace) => ({
      namespace: namespace.namespaceInfo?.name ?? '',
    })),
  );
</script>

<PageTitle
  title={`Edit ${translate('nexus.nexus-endpoint', { id: $page.params.id })}`}
  url={$page.url.href}
/>
{#if endpoint}
  <div class="flex flex-col gap-4">
    <Link href={routeForNexusEndpoint($page.params.id)} icon="chevron-left">
      {translate('nexus.back-to-endpoint')}
    </Link>
    <NexusEditEndpoint
      {endpoint}
      {targetNamespaceList}
      {onUpdate}
      {onDelete}
      {loading}
      cancelHref={routeForNexusEndpoint($page.params.id)}
    />
  </div>
{/if}
