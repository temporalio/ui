<!-- Which deployed Modal Function runs the Worker. -->
<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical } from '$lib/io/icon';

  import type { ComputeSectionProps } from './types';

  let { values = $bindable(), errors, fieldId }: ComputeSectionProps = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-6">
    <Input
      bind:value={values.modalAppName}
      id={fieldId('modalAppName')}
      name={fieldId('modalAppName')}
      spellcheck={false}
      label={translate('workers.modal-app-name-label')}
      hintText={errors.modalAppName?.[0] ||
        translate('workers.modal-app-name-hint')}
      error={!!errors.modalAppName?.[0]}
      placeholder={translate('workers.modal-app-name-placeholder')}
      required
      class="flex-1"
    />
    <Button
      variant="tertiary"
      type="button"
      href="https://modal.com/apps"
      target="_blank"
      TrailingIcon={IconExternalLinkOptical}
    >
      {translate('workers.open-modal-dashboard')}
    </Button>
  </div>
  <Input
    bind:value={values.modalFunctionName}
    id={fieldId('modalFunctionName')}
    name={fieldId('modalFunctionName')}
    spellcheck={false}
    label={translate('workers.modal-function-name-label')}
    hintText={errors.modalFunctionName?.[0] ||
      translate('workers.modal-function-name-hint')}
    error={!!errors.modalFunctionName?.[0]}
    placeholder={translate('workers.modal-function-name-placeholder')}
    required
  />
  <Input
    bind:value={values.modalEnvironment}
    id={fieldId('modalEnvironment')}
    name={fieldId('modalEnvironment')}
    spellcheck={false}
    label={translate('workers.modal-environment-label')}
    hintText={errors.modalEnvironment?.[0] ||
      translate('workers.modal-environment-hint')}
    error={!!errors.modalEnvironment?.[0]}
    placeholder={translate('workers.modal-environment-placeholder')}
    required
  />
  <Input
    bind:value={values.modalWorkspaceId}
    id={fieldId('modalWorkspaceId')}
    name={fieldId('modalWorkspaceId')}
    spellcheck={false}
    label={translate('workers.modal-workspace-id-label')}
    hintText={errors.modalWorkspaceId?.[0] ||
      translate('workers.modal-workspace-id-hint')}
    error={!!errors.modalWorkspaceId?.[0]}
    placeholder={translate('workers.modal-workspace-id-placeholder')}
  />
  <Input
    bind:value={values.modalVersion}
    id={fieldId('modalVersion')}
    name={fieldId('modalVersion')}
    spellcheck={false}
    label={translate('workers.modal-version-label')}
    hintText={errors.modalVersion?.[0] ||
      translate('workers.modal-version-hint')}
    error={!!errors.modalVersion?.[0]}
    placeholder="0"
  />
</div>
