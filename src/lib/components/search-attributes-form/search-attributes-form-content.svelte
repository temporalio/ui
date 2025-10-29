<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import Message from '$lib/components/form/message.svelte';
  import TaintedBadge from '$lib/components/form/tainted-badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';

  import type {
    SearchAttributeDefinition,
    SearchAttributeTypeOption,
  } from './types';

  import SearchAttributeRow from './search-attribute-row.svelte';

  interface Props {
    class?: string;
    initialAttributes: SearchAttributeDefinition[];
    onSave: (attributes: SearchAttributeDefinition[]) => Promise<void>;
    onSuccess?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
    hideTainted?: boolean;
    hideDeleteButton?: boolean;
    hideCancelButton?: boolean;
    disableTypeForExisting?: boolean;
    getSupportedTypes: () => SearchAttributeTypeOption[];
  }

  let {
    class: className = '',
    initialAttributes,
    onSave,
    onSuccess = () => {},
    onCancel,
    hideTainted = false,
    hideDeleteButton = false,
    hideCancelButton = false,
    disableTypeForExisting = false,
    getSupportedTypes,
  }: Props = $props();

  const supportedTypes = $derived(getSupportedTypes());
  const defaultType = $derived(supportedTypes[0]?.value || '');

  // Create form schema
  const createFormSchema = (typeValues: string[]) => {
    return z.object({
      attributes: z
        .array(
          z.object({
            name: z
              .string()
              .min(1, translate('search-attributes.validation-name-required')),
            type: z.enum(typeValues as [string, ...string[]]),
          }),
        )
        .refine(
          (attributes) => {
            const names = attributes.map((attr) => attr.name);
            return names.length === new Set(names).size;
          },
          {
            message: translate('search-attributes.validation-names-unique'),
          },
        ),
    });
  };

  const typeValues = getSupportedTypes().map((type) => type.value);

  const {
    form: formData,
    errors,
    submitting,
    message,
    enhance,
    tainted,
    reset,
  } = superForm(
    { attributes: initialAttributes },
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(createFormSchema(typeValues)),
      resetForm: false,
      onUpdate: async ({ form }) => {
        if (!form.valid) return;

        try {
          await onSave(form.data.attributes);
          onSuccess(form.data.attributes);
          return { type: 'success' };
        } catch (error) {
          return {
            type: 'error',
            error: {
              message:
                error.message || translate('search-attributes.save-error'),
            },
          };
        }
      },
    },
  );

  const addAttribute = () => {
    $formData.attributes = [
      ...$formData.attributes,
      { name: '', type: defaultType },
    ];
  };

  const removeAttribute = (index: number) => {
    $formData.attributes = $formData.attributes.filter((_, i) => i !== index);
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const taintedCount = $derived(
    Object.values($tainted?.attributes || {}).filter((attr) =>
      Object.values(attr).some((value) => value === true),
    ).length,
  );

  const disabled = $derived($submitting || taintedCount === 0);

  // Track initial attribute names to identify existing attributes
  const initialAttributeNames = $derived(
    new Set(initialAttributes.map((attr) => attr.name)),
  );
</script>

<Card class={className}>
  <form use:enhance>
    <div class="p-4">
      <div class="space-y-4">
        <Message value={$message} />

        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Search Attributes</h3>
        </div>

        <div class="space-y-3 border-b border-b-subtle pb-3">
          <div
            class="grid gap-3 border-b border-b-subtle pb-2 text-sm font-medium"
            class:grid-cols-[1fr,200px,auto]={!hideDeleteButton}
            class:grid-cols-[1fr,200px]={hideDeleteButton}
          >
            <div>{translate('search-attributes.column-attribute')}</div>
            <div>{translate('search-attributes.column-type')}</div>
            {#if !hideDeleteButton}
              <div class="w-8"></div>
            {/if}
          </div>

          {#each $formData.attributes as attribute, index}
            <SearchAttributeRow
              {attribute}
              {index}
              {supportedTypes}
              submitting={$submitting}
              error={$errors?.attributes?.[index]?.['name']?.[0]}
              {hideDeleteButton}
              {disableTypeForExisting}
              {initialAttributeNames}
              onRemove={() => removeAttribute(index)}
            />
          {/each}
        </div>
      </div>
    </div>

    <div class="p-4 pt-0">
      <div class="flex gap-3">
        <Button size="sm" type="submit" {disabled} loading={$submitting}>
          <TaintedBadge show={!hideTainted} count={taintedCount} />
          {translate('search-attributes.save-button')}
        </Button>

        {#if !hideCancelButton}
          <Button
            variant="secondary"
            size="sm"
            on:click={handleCancel}
            disabled={$submitting}
            type="button"
          >
            {translate('common.cancel')}
          </Button>
        {/if}

        <Button
          variant="ghost"
          size="sm"
          on:click={addAttribute}
          disabled={$submitting}
          type="button"
          leadingIcon="add"
        >
          {translate('search-attributes.add-attribute-button')}
        </Button>
      </div>
    </div>
  </form>
</Card>
