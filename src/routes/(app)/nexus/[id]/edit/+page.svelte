<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { endpointForm } from '$lib/pages/nexus-form.svelte';
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
  let error: NetworkError | undefined = undefined;

  const onSave = async () => {
    error = undefined;
    const body = { ...$endpointForm };
    body.id = endpoint.id;
    body.version = endpoint.version;
    // delete body.spec.description;
    console.log('Endpoint body: ', body);
    try {
      await updateNexusEndpoint(endpoint.id, body);
    } catch (e: unknown) {
      error = e as NetworkError;
      console.error('Error updating endpoint', e);
    }
  };

  const onDelete = async () => {
    try {
      await deleteNexusEndpoint(endpoint.id, endpoint.version);
      deleteConfirmationModalOpen = false;
      confirmDeleteInput = '';
      goto(routeForNexus());
    } catch (e) {
      error = e as NetworkError;
      console.error('Error deleting endpoint', e);
    }
  };

  $: namespaceList = $namespaces.map((namespace) => ({
    namespace: namespace.namespaceInfo.name,
  }));
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<NexusEditEndpoint {endpoint} {namespaceList} {onUpdate} {onDelete} {error} />
