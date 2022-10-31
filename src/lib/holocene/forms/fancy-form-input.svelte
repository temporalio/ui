<script lang="ts">
  import {
    Hint,
    HintGroup,
    validators,
    required as formRequired,
  } from 'svelte-use-form';
  import type { FormField } from '$holocene/forms';
  import Input from '../input/input.svelte';

  export let field: FormField;
  export let suffix: string;

  const { key, label, validations, hint, required, placeholder } = field;
</script>

<div class="flex gap-0">
  <input
    name={key}
    placeholder={placeholder ?? ''}
    use:validators={validations ?? required ? [formRequired] : []}
  />
  <div class="suffix">
    {suffix}
  </div>
</div>

<!-- {#if required}
  <HintGroup for={key}>
    <Hint on="required"
      ><small class="text-orange-500">{hint ?? 'Required'}</small></Hint
    >
  </HintGroup>
{/if}
{#if !required && hint}
  <small class="text-gray-500">{hint}</small>
{/if} -->
<style lang="postcss">
  input {
    @apply block w-full rounded-tl-md rounded-bl-md border border-gray-900 p-2;
  }
  .suffix {
    @apply block w-full rounded-tr-md rounded-br-md border border-gray-900 border-l-0 p-2 bg-gray-100;
  }
  label {
    @apply text-sm text-gray-700;
  }
  .required {
    @apply border-red-400;
  }
</style>
