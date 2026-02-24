<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { type NexusFormData } from '$lib/pages/nexus-form.svelte';
  import type { NexusEndpoint } from '$lib/types/nexus';

  type Props = {
    endpoint: NexusEndpoint;
    targetNamespaceList?: { namespace: string }[];
    callerNamespaceList?: { namespace: string }[];
    onUpdate: (formData: NexusFormData) => Promise<void>;
    onDelete: () => Promise<void>;
    loading?: boolean;
    isCloud?: boolean;
    nameRegexPattern?: RegExp;
    cancelHref?: string;
  };

  let {
    endpoint,
    targetNamespaceList = [],
    callerNamespaceList = [],
    onUpdate,
    onDelete,
    loading = false,
    isCloud = false,
    nameRegexPattern = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
    cancelHref = '/nexus',
  }: Props = $props();

  let deleteConfirmationModalOpen = $state(false);
  let confirmDeleteInput = $state('');
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-1">
    <h1 data-testid="namespace-selector-title">
      {endpoint.spec?.name || ''}
    </h1>
  </div>
  <NexusForm
    {endpoint}
    {nameRegexPattern}
    nameHintText=""
    {targetNamespaceList}
    {callerNamespaceList}
    {isCloud}
    {cancelHref}
    submitButtonText={translate('common.save')}
    onSubmit={onUpdate}
    nameDisabled
  >
    {#snippet footer({ submitting })}
      <div class="flex w-full grow justify-end">
        <Button
          variant="destructive"
          disabled={submitting}
          class="max-sm:w-full"
          on:click={() => (deleteConfirmationModalOpen = true)}
          data-testid="delete-endpoint-button"
        >
          {translate('common.delete')}
        </Button>
      </div>
    {/snippet}
  </NexusForm>
</div>
<Modal
  id="delete-endpoint-modal"
  bind:open={deleteConfirmationModalOpen}
  {loading}
  confirmType="destructive"
  confirmText={translate('common.delete')}
  cancelText={translate('common.cancel')}
  on:confirmModal={onDelete}
  on:cancelModal={() => (deleteConfirmationModalOpen = false)}
  confirmDisabled={confirmDeleteInput !== endpoint.spec?.name}
>
  <h3 slot="title">{translate('nexus.delete-modal-title')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <p>
      {translate('nexus.delete-modal-confirmation-preface')}
      <strong class="select-all">{endpoint.spec?.name || ''}</strong>?
      {translate('nexus.delete-modal-confirmation-postface')}
    </p>
    <p>
      {translate('nexus.type-confirm-preface')}
      <strong class="select-all">{endpoint.spec?.name || ''}</strong>
      {translate('nexus.type-confirm-postface')}
    </p>
    <Input
      id="delete-endpoint"
      labelHidden
      label={translate('nexus.delete-endpoint')}
      bind:value={confirmDeleteInput}
    />
  </div>
</Modal>
