<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm from '$lib/pages/nexus-form.svelte';
  import type { NetworkError } from '$lib/types/global';

  type Props = {
    onCreate: () => void;
    targetNamespaceList?: { namespace: string }[];
    callerNamespaceList?: { namespace: string }[];
    error?: NetworkError | undefined;
    loading?: boolean;
    isCloud?: boolean;
    nameRegexPattern?: RegExp;
    nameHintText?: string;
    cancelHref?: string;
    successHref?: string;
    projectId?: string;
  };

  let {
    onCreate,
    targetNamespaceList = [],
    callerNamespaceList = [],
    error = undefined,
    loading = false,
    isCloud = false,
    nameRegexPattern = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
    nameHintText = translate('nexus.endpoint-name-hint-with-dash'),
    cancelHref = '/nexus',
    successHref: _successHref = undefined,
    projectId: _projectId = undefined,
  }: Props = $props();

  let formComponent: NexusForm | undefined;

  const createDisabled = $derived(!formComponent?.isFormValid());

  export function getFormData() {
    return formComponent?.getFormData();
  }
</script>

<div class="flex w-full flex-col gap-8">
  <NexusForm
    bind:this={formComponent}
    {nameRegexPattern}
    {nameHintText}
    {error}
    {targetNamespaceList}
    {callerNamespaceList}
    {isCloud}
  />
  <div class="flex flex-row items-center gap-4 max-sm:flex-col">
    <Button
      variant="primary"
      on:click={onCreate}
      disabled={createDisabled}
      class="max-sm:w-full"
      {loading}>{translate('nexus.create-endpoint')}</Button
    >
    <Button
      variant="ghost"
      class="max-sm:w-full"
      on:click={() => goto(cancelHref)}>{translate('common.cancel')}</Button
    >
  </div>
</div>
