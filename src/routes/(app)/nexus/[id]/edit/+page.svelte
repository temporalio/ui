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
  import { routeForNexus } from '$lib/utilities/route-for';

  import type { LayoutData } from '../$types';

  export let data: LayoutData;

  $: ({ endpoint } = data);

  let deleteConfirmationModalOpen = false;
  let confirmDeleteInput = '';

  console.log(deleteConfirmationModalOpen, confirmDeleteInput);

  let error: NetworkError | undefined = undefined;
  let loading = false;

  const onUpdate = async () => {
    error = undefined;
    loading = true;
    const body = { ...$endpointForm };
    body.id = endpoint.id;
    body.version = endpoint.version;

    // TODO: Set this as a legit payload with data = body.spec.description;
    body.spec.description = {};
    try {
      await updateNexusEndpoint(endpoint.id, body);
      goto(routeForNexus());
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
      deleteConfirmationModalOpen = false;
      confirmDeleteInput = '';
      goto(routeForNexus());
    } catch (e) {
      error = e as NetworkError;
      console.error('Error deleting endpoint', e);
    } finally {
      loading = false;
    }
  };

  $: namespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<NexusEditEndpoint
  {endpoint}
  {loading}
  {namespaceList}
  {onUpdate}
  {onDelete}
  {error}
/>
