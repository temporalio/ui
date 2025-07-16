<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';

  import type {
    SearchAttributeDefinition,
    SearchAttributesAdapter,
  } from './types';

  import { createFormConfig, createFormHandlers } from './config.svelte';

  interface Props {
    class?: string;
    adapter: SearchAttributesAdapter;
    initialAttributes: SearchAttributeDefinition[];
  }

  let { class: className = '', adapter, initialAttributes }: Props = $props();

  const { superFormInstance, supportedTypes, defaultType } = $derived(
    createFormConfig(
      adapter,
      adapter.onSuccess || (() => {}),
      initialAttributes,
    ),
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

  const { addAttribute, removeAttribute, handleCancel } = $derived(
    createFormHandlers(
      form,
      defaultType,
      initialAttributes,
      adapter.onCancel || (() => {}),
      reset,
    ),
  );
</script>

<div class="space-y-6 {className}">
  <form use:enhance class="space-y-4">
    <Card class="space-y-3">
      <div
        class="text-gray-700 grid grid-cols-[1fr_140px_40px] gap-3 border-b border-subtle pb-2 text-sm font-medium"
      >
        <div>{translate('search-attributes.column-attribute')}</div>
        <div>{translate('search-attributes.column-type')}</div>
        <div></div>
      </div>

      {#each $form.attributes as attribute, index}
        <div class="grid grid-cols-[1fr_140px_40px] items-start gap-3">
          <Input
            id={`attributes-${index}`}
            label={translate('search-attributes.attribute-label', {
              index: index + 1,
            })}
            labelHidden={true}
            name={`attributes.${index}.name`}
            bind:value={attribute.name}
            placeholder=""
            error={!!$errors.attributes?.[index]?.['name']?.[0]}
            hintText={$errors.attributes?.[index]?.['name']?.[0]}
            disabled={$submitting}
          />

          <Select
            id={`attributes-${index}-type`}
            label={translate('search-attributes.type-label', {
              index: index + 1,
            })}
            labelHidden={true}
            name={`attributes.${index}.type`}
            placeholder={translate('search-attributes.select-type-placeholder')}
            error={$errors.attributes?.[index]?.['type']?.[0]}
            bind:value={attribute.type}
            disabled={$submitting}
          >
            {#each supportedTypes as option}
              <Option value={option.value}>
                {option.label}
              </Option>
            {/each}
          </Select>

          <Button
            variant="ghost"
            size="sm"
            on:click={() => removeAttribute(index)}
            disabled={$submitting}
            class="h-10 w-10 p-0"
          >
            <Icon name="trash" />
          </Button>
        </div>
      {/each}

      <div class="border-t border-subtle pt-4">
        <Button
          variant="secondary"
          size="sm"
          on:click={addAttribute}
          disabled={$submitting}
        >
          {translate('search-attributes.add-attribute-button')}
        </Button>
      </div>
    </Card>

    <!-- Form-level validation errors -->
    {#if $errors.attributes?.attributes}
      <Alert
        intent="error"
        title={translate('search-attributes.validation-error-title')}
      >
        {#each $errors.attributes.attributes as error}
          <p>{error}</p>
        {/each}
      </Alert>
    {/if}

    <!-- Status message -->
    {#if $message}
      <Alert intent={$message.intent} title={$message.title}>
        {$message.text}
      </Alert>
    {/if}

    <div class="flex gap-3 pt-4">
      <Button
        type="submit"
        variant="primary"
        disabled={$submitting || $form.attributes.length === 0}
        class="relative"
      >
        {$submitting
          ? translate('search-attributes.saving-button')
          : translate('search-attributes.save-button')}
        {#if isTainted($tainted)}
          <Badge
            class="absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px]"
            type="count"
          >
            {Object.values($tainted.attributes || {}).filter((attr) =>
              Object.values(attr).some((value) => value === true),
            ).length}
          </Badge>
        {/if}
      </Button>

      <Button
        type="button"
        variant="secondary"
        on:click={handleCancel}
        disabled={$submitting}
      >
        {translate('search-attributes.cancel-button')}
      </Button>
    </div>
  </form>
</div>
