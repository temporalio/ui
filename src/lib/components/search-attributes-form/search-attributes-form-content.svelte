<script lang="ts">
  import type { Snippet } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import Message from '$lib/components/form/message.svelte';
  import TaintedBadge from '$lib/components/form/tainted-badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  import type {
    SearchAttributeDefinition,
    SearchAttributeTypeOption,
  } from './types';

  import SearchAttributeRow from './search-attribute-row.svelte';

  interface Props {
    class?: string;
    description?: Snippet;
    initialAttributes: SearchAttributeDefinition[];
    onSave: (attributes: SearchAttributeDefinition[]) => Promise<void>;
    onSuccess?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
    hideTainted?: boolean;
    disableTypeForExisting?: boolean;
    isCloud?: boolean;
  }

  let {
    class: className = '',
    description,
    initialAttributes,
    onSave,
    onSuccess = () => {},
    onCancel,
    hideTainted = false,
    disableTypeForExisting = false,
    isCloud = false,
  }: Props = $props();

  const supportedTypes: SearchAttributeTypeOption[] = [
    {
      label: translate('search-attributes.type-keyword'),
      value: 'Keyword',
    },
    {
      label: translate('search-attributes.type-text'),
      value: 'Text',
    },
    {
      label: translate('search-attributes.type-int'),
      value: 'Int',
    },
    {
      label: translate('search-attributes.type-double'),
      value: 'Double',
    },
    {
      label: translate('search-attributes.type-bool'),
      value: 'Bool',
    },
    {
      label: translate('search-attributes.type-datetime'),
      value: 'Datetime',
    },
    {
      label: translate('search-attributes.type-keywordlist'),
      value: 'KeywordList',
    },
  ];
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
            isExisting: z.boolean().optional().default(false),
            initialName: z.string().optional().default(''),
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

  const typeValues = supportedTypes.map((type) => type.value);

  // svelte-ignore state_referenced_locally
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
                (error as Error).message ||
                translate('search-attributes.save-error'),
            },
          };
        }
      },
    },
  );

  const addAttribute = () => {
    $formData.attributes = [
      ...$formData.attributes,
      { name: '', type: defaultType, isDeletable: true, isExisting: false },
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

<Card class="p-5 {className}">
  <form use:enhance>
    <div class="space-y-4">
      <Message value={$message} />

      <div>
        <h2 class="text-base font-medium">
          {translate('search-attributes.title')}
        </h2>
        {#if description}
          {@render description()}
        {:else}
          <p class="text-sm text-secondary">
            {translate('search-attributes.description')}
            <Link href="https://docs.temporal.io/search-attribute" newTab
              >{translate('search-attributes.docs-link')}</Link
            >.
          </p>
        {/if}
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

        {#each $formData.attributes as attribute, index (index)}
          <SearchAttributeRow
            name={attribute.name ?? ''}
            type={attribute.type ?? ''}
            {index}
            {supportedTypes}
            submitting={$submitting}
            error={($errors?.attributes?.[index] as { name?: string[] })
              ?.name?.[0]}
            {disableTypeForExisting}
            {isCloud}
            isDeletable={$formData.attributes[index].isDeletable}
            isExisting={$formData.attributes[index].isExisting}
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

      <div class="flex gap-3">
        <Button size="sm" type="submit" {disabled} loading={$submitting}>
          <TaintedBadge show={!hideTainted} count={taintedCount} />
          {translate('search-attributes.save-button')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          on:click={handleCancel}
          disabled={$submitting}
          type="button"
        >
          {translate('common.cancel')}
        </Button>
      </div>
    </div>
  </form>
</Card>
