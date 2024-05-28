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
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="flex flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title" class="text-2xl">
        {endpoint.spec.name}
      </h1>
      <div class="flex items-center gap-2">
        <Button
          variant="destructive"
          on:click={() => (deleteConfirmationModalOpen = true)}
          >{translate('nexus.delete-endpoint')}</Button
        >
        <Button on:click={onSave}>{translate('common.save')}</Button>
      </div>
    </div>
  </div>
  <NexusForm endpoint={data.endpoint} {error} />
  <div class="flex items-center gap-4">
    <Button on:click={onSave}>{translate('common.save')}</Button>
    <Button variant="ghost">{translate('common.cancel')}</Button>
  </div>
</div>
<Modal
  id="delete-endpoint-modal"
  bind:open={deleteConfirmationModalOpen}
  confirmType="destructive"
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  on:confirmModal={onDelete}
  on:cancelModal={() => (deleteConfirmationModalOpen = false)}
  confirmDisabled={confirmDeleteInput !== `DELETE ${endpoint.id}`}
>
  <h3 slot="title">{translate('nexus.delete-modal-title')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <p>
      {translate('nexus.delete-modal-confirmation', {
        endpoint: endpoint.id,
      })}
    </p>
    <Input
      id="delete-endpoint"
      required
      label={translate('nexus.delete-modal-confirmation-label', {
        endpoint: endpoint.id,
      })}
      bind:value={confirmDeleteInput}
    />
  </div>
</Modal>
