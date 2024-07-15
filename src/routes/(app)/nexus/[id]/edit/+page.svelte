<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEditEndpoint from '$lib/pages/nexus-edit-endpoint.svelte';
  import { endpointForm } from '$lib/pages/nexus-form.svelte';
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

  export let data: LayoutData;

  $: ({ endpoint } = data);

  let error: NetworkError | undefined = undefined;
  let loading = false;

  const onUpdate = async () => {
    error = undefined;
    loading = true;
    const body = { ...$endpointForm };
    body.id = endpoint.id;
    body.version = endpoint.version;

    const payloads = await encodePayloads(
      JSON.stringify(body.spec.descriptionString),
    );
    body.spec.description = payloads[0];

    delete body.spec.allowedCallerNamespaces;
    delete body.spec.descriptionString;

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
    error = undefined;
    loading = true;
    try {
      await deleteNexusEndpoint(endpoint.id, endpoint.version);
      goto(routeForNexus());
    } catch (e) {
      error = e as NetworkError;
      console.error('Error deleting endpoint', e);
    } finally {
      loading = false;
    }
  };

  $: targetNamespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<PageTitle
  title={`Edit ${translate('nexus.nexus-endpoint', { id: $page.params.id })}`}
  url={$page.url.href}
/>
<NexusEditEndpoint
  {endpoint}
  {loading}
  {targetNamespaceList}
  {onUpdate}
  {onDelete}
  {error}
/>
