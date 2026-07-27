<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import Message from '$lib/components/form/message.svelte';
  import TaintedBadge from '$lib/components/form/tainted-badge.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { CodecServerFormData } from './types';

  interface Props {
    class?: string;
    initialData: CodecServerFormData;
    onSave: (data: CodecServerFormData) => Promise<void>;
    onSuccess?: (data: CodecServerFormData) => void;
    onCancel?: () => void;
    hideTainted?: boolean;
    hideCancelButton?: boolean;
  }

  let {
    class: className = '',
    initialData,
    onSave,
    onSuccess = () => {},
    onCancel,
    hideTainted = false,
    hideCancelButton = false,
  }: Props = $props();

  // Show custom section if there are existing values
  let showCustomSection = $state(
    !!(initialData.customMessage || initialData.customLink),
  );

  const codecServerSchema = z.object({
    endpoint: z
      .string()
      .refine((val) => val === '' || z.string().url().safeParse(val).success, {
        message: translate('codec-server.validation-endpoint-url'),
      }),
    passUserAccessToken: z.boolean(),
    includeCrossOriginCredentials: z.boolean(),
    customMessage: z.string().optional(),
    customLink: z
      .string()
      .refine((val) => val === '' || z.string().url().safeParse(val).success, {
        message: translate('codec-server.validation-custom-link-url'),
      })
      .optional(),
  });

  const formInstance = superForm(
    {
      endpoint: initialData.endpoint || '',
      passUserAccessToken: initialData.passUserAccessToken || false,
      includeCrossOriginCredentials:
        initialData.includeCrossOriginCredentials || false,
      customMessage: initialData.customMessage || '',
      customLink: initialData.customLink || '',
    },
    {
      SPA: true,
      dataType: 'json',
      resetForm: false,
      validators: zodClient(codecServerSchema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          const dataToSave = {
            ...form.data,
            customMessage: showCustomSection ? form.data.customMessage : '',
            customLink: showCustomSection ? form.data.customLink : '',
          };
          await onSave(dataToSave);
          onSuccess(dataToSave);
          return { type: 'success' };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to save codec server configuration';
          return {
            type: 'error',
            error: {
              message: errorMessage,
            },
          };
        }
      },
    },
  );

  const { form, errors, submitting, message, enhance, tainted, reset } =
    formInstance;

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const taintedCount = $derived(
    $tainted
      ? Object.values($tainted).filter((value) => value === true).length
      : 0,
  );

  const disabled = $derived($submitting || taintedCount === 0);
</script>

<Card class="p-5 {className}">
  <form use:enhance>
    <div class="space-y-6">
      <Message value={$message} />

      <!-- Title and Description -->
      <div>
        <h2 class="text-base font-medium">{translate('codec-server.title')}</h2>
        <p class="text-sm text-secondary">
          {translate('codec-server.description')}
        </p>
      </div>

      <!-- Info Alert -->
      <Alert intent="info" class="text-sm">
        <Icon name="info" slot="icon" />
        {translate('codec-server.info-message')}
      </Alert>

      <!-- Endpoint Input -->
      <div class="space-y-2">
        <p class="text-sm text-secondary">
          {translate('codec-server.endpoint-description-prefix')}
          <Link
            href="https://docs.temporal.io/dataconversion#codec-server"
            newTab
          >
            {translate('codec-server.endpoint-link-text')}
          </Link>
          {translate('codec-server.endpoint-description-suffix')}
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
      {#if showCustomSection}
        <div class="space-y-4">
          <p class="text-sm text-secondary">
            {translate('codec-server.custom-section-description')}
          </p>
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
              <p class="text-sm text-secondary">
                {translate('codec-server.custom-link-description')}
              </p>
            </div>

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                on:click={() => {
                  showCustomSection = false;
                  $form.customMessage = '';
                  $form.customLink = '';
                }}
              >
                <Icon name="trash" class="h-4 w-4" />
                {translate('codec-server.remove-custom-button')}
              </Button>
            </div>
          </div>
        </div>
      {/if}

      {#if !showCustomSection}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          on:click={() => (showCustomSection = true)}
          disabled={$submitting}
          leadingIcon="add"
        >
          {translate('codec-server.add-custom-button')}
        </Button>
      {/if}
    </div>

    <div class="mt-4 flex gap-3">
      <Button
        type="submit"
        size="sm"
        variant="primary"
        {disabled}
        loading={$submitting}
      >
        <TaintedBadge show={!hideTainted} count={taintedCount} />
        {translate('codec-server.save-button')}
      </Button>

      {#if !hideCancelButton}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          on:click={handleCancel}
          disabled={$submitting}
        >
          {translate('common.cancel')}
        </Button>
      {/if}
    </div>
  </form>
</Card>
