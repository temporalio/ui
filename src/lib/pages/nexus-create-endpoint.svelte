<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import NexusForm, {
    type NexusFormData,
    type ValidateNamespacesExist,
  } from '$lib/pages/nexus-form.svelte';

  type Props = {
    onCreate: (formData: NexusFormData) => Promise<void>;
    targetNamespaceList?: { namespace: string }[];
    callerNamespaceList?: { namespace: string }[];
    isCloud?: boolean;
    nameRegexPattern?: RegExp;
    nameHintText?: string;
    cancelHref?: string;
    validateNamespacesExist?: ValidateNamespacesExist;
  };

  let {
    onCreate,
    targetNamespaceList = [],
    callerNamespaceList = [],
    isCloud = false,
    nameRegexPattern = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
    nameHintText = undefined,
    cancelHref = '/nexus',
    validateNamespacesExist,
  }: Props = $props();
</script>

<div class="flex w-full flex-col gap-8">
  <NexusForm
    {nameRegexPattern}
    {nameHintText}
    {targetNamespaceList}
    {callerNamespaceList}
    {isCloud}
    {validateNamespacesExist}
    {cancelHref}
    submitButtonText={translate('nexus.create-endpoint')}
    onSubmit={onCreate}
  />
</div>
