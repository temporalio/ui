<script lang="ts">
  import Message from '$lib/components/form/message.svelte';
  import TaintedBadge from '$lib/components/form/tainted-badge.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { CodecServerAdapter, CodecServerFormData } from './types';

  import { createFormConfig, createFormHandlers } from './config.svelte';

  interface Props {
    class?: string;
    adapter: CodecServerAdapter;
    initialData: CodecServerFormData;
  }

  let { class: className = '', adapter, initialData }: Props = $props();

  const { superFormInstance } = $derived(
    createFormConfig(adapter, adapter.onSuccess || (() => {}), initialData),
  );

  const {
    form,
    errors,
    submitting,
    message,
    enhance,
    tainted,
    isTainted,
    reset,
  } = $derived(superFormInstance);

  const { handleCancel } = $derived(createFormHandlers(adapter, reset));

  const taintedCount = $derived(
    Object.values($tainted || {}).filter((value) => value === true).length,
  );

  // Show custom section if there are existing values
  let showCustomSection = $state(
    !!(initialData.customMessage || initialData.customLink),
  );
</script>

<div class="space-y-6 {className}">
  <form use:enhance class="space-y-6">
    <Card class="space-y-6">
      <!-- Info Alert -->
      <Alert intent="info" class="text-sm">
        <Icon name="info" slot="icon" />
        {translate('codec-server.info-message')}
      </Alert>

      <!-- Endpoint Input -->
      <div class="space-y-2">
        <p class="text-gray-700 text-sm">
          {translate('codec-server.endpoint-description')}
        </p>

        <Input
          id="endpoint"
          label={translate('codec-server.endpoint-label')}
          labelHidden={true}
          name="endpoint"
          bind:value={$form.endpoint}
          placeholder={translate('codec-server.endpoint-placeholder')}
          error={!!$errors.endpoint?.[0]}
          hintText={$errors.endpoint?.[0]}
          disabled={$submitting}
          class="w-full"
        />
      </div>

      <!-- Toggle Switches -->
      <div class="space-y-3">
        <ToggleSwitch
          id="passUserAccessToken"
          label={translate('codec-server.pass-access-token-label')}
          bind:checked={$form.passUserAccessToken}
          disabled={$submitting}
        />

        <ToggleSwitch
          id="includeCrossOriginCredentials"
          label={translate('codec-server.cross-origin-credentials-label')}
          bind:checked={$form.includeCrossOriginCredentials}
          disabled={$submitting}
        />
      </div>

      <!-- Custom Message and Link Section -->
      <div class="space-y-4">
        <p class="text-gray-600 text-sm">
          {translate('codec-server.custom-section-description')}
        </p>

        {#if !showCustomSection}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            on:click={() => (showCustomSection = true)}
          >
            <Icon name="add" class="h-4 w-4" />
            {translate('codec-server.add-custom-button')}
          </Button>
        {/if}

        {#if showCustomSection}
          <div class="space-y-4">
            <div>
              <Textarea
                id="customMessage"
                label={translate('codec-server.custom-message-label')}
                name="customMessage"
                bind:value={$form.customMessage}
                placeholder={translate(
                  'codec-server.custom-message-placeholder',
                )}
                disabled={$submitting}
                rows={3}
              />
            </div>

            <div>
              <Input
                id="customLink"
                label={translate('codec-server.custom-link-label')}
                name="customLink"
                bind:value={$form.customLink}
                placeholder={translate('codec-server.custom-link-placeholder')}
                error={!!$errors.customLink?.[0]}
                hintText={$errors.customLink?.[0]}
                disabled={$submitting}
              />
              <p class="text-gray-600 mt-1 text-sm">
                {translate('codec-server.custom-link-description')}
              </p>
            </div>

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                on:click={() => {
                  // Clear the form values first
                  $form.customMessage = '';
                  $form.customLink = '';
                  // Then hide the section
                  showCustomSection = false;
                }}
              >
                <Icon name="trash" class="h-4 w-4" />
                {translate('codec-server.remove-custom-button')}
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </Card>

    <Message
      value={$message}
      errors={$errors._errors}
      errorsTitle={translate('codec-server.validation-error-title')}
    />

    <div class="flex gap-3">
      <Button
        type="submit"
        variant="primary"
        disabled={$submitting}
        class="relative"
      >
        {$submitting
          ? translate('codec-server.saving-button')
          : translate('codec-server.save-button')}
        <TaintedBadge show={isTainted($tainted)} count={taintedCount} />
      </Button>

      <Button
        type="button"
        variant="secondary"
        on:click={handleCancel}
        disabled={$submitting}
      >
        {translate('codec-server.cancel-button')}
      </Button>
    </div>
  </form>
</div>
