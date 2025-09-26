<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod';

  import Message from '$lib/components/form/message.svelte';
  import TaintedBadge from '$lib/components/form/tainted-badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';

  import type {
    SearchAttributeDefinition,
    SearchAttributeTypeOption,
  } from './types';

  interface Props {
    class?: string;
    initialAttributes: SearchAttributeDefinition[];
    onSave: (attributes: SearchAttributeDefinition[]) => Promise<void>;
    onSuccess?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
    hideTainted?: boolean;
    hideDeleteButton?: boolean;
    hideCancelButton?: boolean;
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
      taintedMessage: true,
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
            <div
              class="grid gap-3"
              class:grid-cols-[1fr,200px,auto]={!hideDeleteButton}
              class:grid-cols-[1fr,200px]={hideDeleteButton}
            >
              <Input
                id="attribute-name-{index}"
                bind:value={attribute.name}
                label={translate('search-attributes.attribute-label', {
                  index: index + 1,
                })}
                labelHidden
                disabled={$submitting}
                error={!!$errors?.attributes?.[index]?.['name']?.[0]}
              />

              <Select
                id="attribute-type-{index}"
                bind:value={attribute.type}
                label={translate('search-attributes.type-label', {
                  index: index + 1,
                })}
                labelHidden
                disabled={$submitting}
                placeholder={translate(
                  'search-attributes.select-type-placeholder',
                )}
              >
                {#each supportedTypes as type}
                  <Option value={type.value}>{type.label}</Option>
                {/each}
              </Select>

              {#if !hideDeleteButton}
                <Button
                  variant="ghost"
                  size="xs"
                  on:click={() => removeAttribute(index)}
                  disabled={$submitting}
                  type="button"
                  leadingIcon="trash"
                />
              {/if}
            </div>
            {#if $errors?.attributes?.[index]?.['name']?.[0]}
              <div class="col-span-2 mt-1 text-xs text-danger">
                {$errors.attributes[index]['name'][0]}
              </div>
            {/if}
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
