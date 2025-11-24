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
            isDeletable: z.boolean().optional().default(true),
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

  // Mark initial attributes as non-deletable
  const attributesWithDeletableFlag: SearchAttributeDefinition[] =
    initialAttributes.map((attr) => ({
      ...attr,
      isDeletable: false,
    }));

  const {
    form: formData,
    errors,
    submitting,
    message,
    enhance,
    tainted,
    reset,
  } = superForm<{ attributes: SearchAttributeDefinition[] }>(
    { attributes: attributesWithDeletableFlag },
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
      { name: '', type: defaultType, isDeletable: true },
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
</script>

<Card class={className}>
  <form use:enhance>
    <div class="p-4">
      <div class="space-y-4">
        <Message value={$message} />

        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Search Attributes</h3>
        </div>

        <div class="space-y-3 pb-3">
          <div
            class="grid grid-cols-[1fr,200px,auto] gap-3 text-sm font-medium"
            class:hidden={$formData.attributes.length === 0}
          >
            <div>{translate('search-attributes.column-attribute')}</div>
            <div>{translate('search-attributes.column-type')}</div>
            <div class="w-8"></div>
          </div>

          {#each $formData.attributes as _, index}
            <SearchAttributeRow
              name={$formData.attributes[index].name}
              type={$formData.attributes[index].type}
              {index}
              {supportedTypes}
              submitting={$submitting}
              error={$errors?.attributes?.[index]?.['name']?.[0]}
              {disableTypeForExisting}
              isDeletable={$formData.attributes[index].isDeletable ?? true}
              onRemove={() => removeAttribute(index)}
              onNameChange={(value) => {
                $formData.attributes[index].name = value;
              }}
              onTypeChange={(value) => {
                $formData.attributes[index].type = value;
              }}
            />
          {/each}
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        on:click={addAttribute}
        disabled={$submitting}
        type="button"
        leadingIcon="add"
      >
        {translate('search-attributes.add-attribute-button')}
      </Button>
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
      </div>
    </div>
  </form>
</Card>
