<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

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
        Users can use this Namespace-level codec server endpoint or override it in
        their browser with another endpoint.
      </Alert>

      <!-- Endpoint Input -->
      <div class="space-y-2">
        <p class="text-gray-700 text-sm">
          Enter a <button
            type="button"
            class="text-blue-600 underline hover:no-underline"
            >Codec Server endpoint</button
          > to decode payloads for users interacting with this Namespace
        </p>

        <Input
          id="endpoint"
          label="Codec Server Endpoint"
          labelHidden={true}
          name="endpoint"
          bind:value={$form.endpoint}
          placeholder="Paste your endpoint here"
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
          label="Pass the user access token"
          bind:checked={$form.passUserAccessToken}
          disabled={$submitting}
        />

        <ToggleSwitch
          id="includeCrossOriginCredentials"
          label="Include cross-origin credentials"
          bind:checked={$form.includeCrossOriginCredentials}
          disabled={$submitting}
        />
      </div>

      <!-- Custom Message and Link Section -->
      <div class="space-y-4">
        <p class="text-gray-600 text-sm">
          Optionally customize the error message and provide a redirect link for
          users when the Codec Server fails.
        </p>

        {#if !showCustomSection}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            on:click={() => (showCustomSection = true)}
          >
            <Icon name="add" class="h-4 w-4" />
            Add Custom Message and Link
          </Button>
        {/if}

        {#if showCustomSection}
          <div class="space-y-4">
            <div>
              <Textarea
                id="customMessage"
                label="Custom Message"
                name="customMessage"
                bind:value={$form.customMessage}
                placeholder=""
                disabled={$submitting}
                rows={3}
              />
            </div>

            <div>
              <Input
                id="customLink"
                label="Custom Link"
                name="customLink"
                bind:value={$form.customLink}
                placeholder=""
                error={!!$errors.customLink?.[0]}
                hintText={$errors.customLink?.[0]}
                disabled={$submitting}
              />
              <p class="text-gray-600 mt-1 text-sm">
                Only include trusted links. This URL will be visible to end
                users and should point to a secure destination in case of Codec
                Server failure.
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
                Remove Custom Message and Link
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </Card>

    <!-- Status message -->
    {#if $message}
      <Alert intent={$message.intent} title={$message.title}>
        {$message.text}
      </Alert>
    {/if}

    <div class="flex gap-3">
      <Button
        type="submit"
        variant="primary"
        disabled={$submitting}
        class="relative"
      >
        {$submitting ? 'Saving...' : 'Save'}
        {#if isTainted($tainted)}
          <Badge
            class="absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px]"
            type="count"
          >
            {Object.values($tainted || {}).filter((value) => value === true)
              .length}
          </Badge>
        {/if}
      </Button>

      <Button
        type="button"
        variant="secondary"
        on:click={handleCancel}
        disabled={$submitting}
      >
        Cancel
      </Button>
    </div>
  </form>
</div>
