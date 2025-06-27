<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';

  import type {
    SearchAttributeDefinition,
    SearchAttributesAdapter,
  } from './types';

  import { createFormConfig, createFormHandlers } from './config.svelte';

  interface Props {
    class?: string;
    adapter: SearchAttributesAdapter;
    initialAttributes: SearchAttributeDefinition[];
    onSave?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
  }

  let {
    class: className = '',
    adapter,
    initialAttributes,
    onSave = () => {},
    onCancel = () => {},
  }: Props = $props();

  const { superFormInstance, supportedTypes, defaultType } = $derived(
    createFormConfig(adapter, onSave, initialAttributes),
  );

  const { form, errors, submitting, message, enhance } =
    $derived(superFormInstance);

  const { addAttribute, removeAttribute, handleCancel } = $derived(
    createFormHandlers(form, defaultType, initialAttributes, onCancel),
  );
</script>

<div class="space-y-6 {className}">
  <form use:enhance class="space-y-4">
    <Card class="space-y-3">
      <div
        class="text-gray-700 grid grid-cols-[1fr_140px_40px] gap-3 border-b border-subtle pb-2 text-sm font-medium"
      >
        <div>Attribute</div>
        <div>Type</div>
        <div></div>
      </div>

      {#each $form.attributes as attribute, index}
        <div class="grid grid-cols-[1fr_140px_40px] items-start gap-3">
          <Input
            id={`attributes-${index}`}
            label={`Attribute ${index + 1}`}
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
            label={`Type for Attribute ${index + 1}`}
            labelHidden={true}
            name={`attributes.${index}.type`}
            placeholder="Select type"
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
          on:click={addAttribute}
          disabled={$submitting}
        >
          Add New Custom Search Attribute
        </Button>
      </div>
    </Card>

    <!-- Form-level validation errors -->
    {#if $errors.attributes?.attributes}
      <Alert intent="error" title="Validation Error">
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
      >
        {$submitting ? 'Saving...' : 'Save'}
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
