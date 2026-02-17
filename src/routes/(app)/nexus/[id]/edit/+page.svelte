<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEditEndpoint from '$lib/pages/nexus-edit-endpoint.svelte';
  import {
    deleteNexusEndpoint,
    updateNexusEndpoint,
  } from '$lib/services/nexus-service';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NetworkError } from '$lib/types/global';
  import { encodePayloads } from '$lib/utilities/encode-payload';
  import {
    routeForNexus,
    routeForNexusEndpoint,
  } from '$lib/utilities/route-for';

  import type { LayoutData } from '../$types';

  let { data }: { data: LayoutData } = $props();

  const { endpoint } = $derived(data);

  let error = $state<NetworkError | undefined>(undefined);
  let loading = $state(false);
  let editEndpointComponent: NexusEditEndpoint;

  const onUpdate = async () => {
    if (!endpoint?.id) return;

    error = undefined;
    loading = true;
    const formData = editEndpointComponent.getFormData();
    const body = { ...formData };
    body.id = endpoint.id;
    body.version = endpoint.version;

    if (body.spec) {
      const payloads = await encodePayloads({
        input: JSON.stringify(body.spec.descriptionString),
        encoding: 'json/plain',
      });
      body.spec.description = payloads?.[0];

      delete body.spec.allowedCallerNamespaces;
      delete body.spec.descriptionString;
    }

    try {
      await updateNexusEndpoint(endpoint.id, body);
      goto(routeForNexusEndpoint(endpoint.id), { invalidateAll: true });
    } catch (e: unknown) {
      error = e as NetworkError;
      console.error('Error updating endpoint', e);
    } finally {
      loading = false;
    }
  };

  const onDelete = async () => {
    if (!endpoint?.id) return;

    error = undefined;
    loading = true;
    try {
      await deleteNexusEndpoint(endpoint.id, String(endpoint.version));
      goto(routeForNexus());
    } catch (e) {
      error = e as NetworkError;
      console.error('Error deleting endpoint', e);
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
      bind:this={editEndpointComponent}
      {endpoint}
      {loading}
      {targetNamespaceList}
      {onUpdate}
      {onDelete}
      {error}
      cancelHref={routeForNexusEndpoint($page.params.id)}
    />
  </div>
{/if}
