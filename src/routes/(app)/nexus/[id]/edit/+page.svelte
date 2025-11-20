<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import type { PageProps } from './$types';

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

  let { data, params }: PageProps = $props();

  const { endpoint } = $derived(data);
  const { id } = $derived(params);

  let error: NetworkError | undefined = $state();
  let loading = $state(false);

  const onUpdate = async () => {
    error = undefined;
    loading = true;
    const body = { ...$endpointForm };
    body.id = endpoint.id;
    body.version = endpoint.version;

    const payloads = await encodePayloads({
      input: JSON.stringify(body.spec.descriptionString),
      encoding: 'json/plain',
    });
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
      namespace: namespace.namespaceInfo.name,
    })),
  );
</script>

<PageTitle
  title="Edit {translate('nexus.nexus-endpoint', { id })}"
  url={page.url.href}
/>
<NexusEditEndpoint
  {endpoint}
  {loading}
  {targetNamespaceList}
  {onUpdate}
  {onDelete}
  {error}
  {...params}
/>
