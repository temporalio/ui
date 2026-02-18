<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { type NexusFormData } from '$lib/pages/nexus-form.svelte';
  import type { NetworkError } from '$lib/types/global';

  type Props = {
    onCreate: (formData: NexusFormData) => Promise<void>;
    targetNamespaceList?: { namespace: string }[];
    callerNamespaceList?: { namespace: string }[];
    error?: NetworkError | undefined;
    isCloud?: boolean;
    nameRegexPattern?: RegExp;
    nameHintText?: string;
    cancelHref?: string;
  };

  let {
    onCreate,
    targetNamespaceList = [],
    callerNamespaceList = [],
    error = undefined,
    isCloud = false,
    nameRegexPattern = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
    nameHintText = undefined,
    cancelHref = '/nexus',
  }: Props = $props();
</script>

<div class="flex w-full flex-col gap-8">
  <NexusForm
    {nameRegexPattern}
    {nameHintText}
    {error}
    {targetNamespaceList}
    {callerNamespaceList}
    {isCloud}
    {cancelHref}
    submitButtonText={translate('nexus.create-endpoint')}
    onSubmit={onCreate}
  />
</div>
