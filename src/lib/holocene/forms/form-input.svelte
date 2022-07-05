<script lang="ts">
  import {
    Hint,
    HintGroup,
    validators,
    required as formRequired,
  } from 'svelte-use-form';
  import type { FormField } from '$holocene/forms';

  export let field: FormField;

  const { key, label, validations, hint, required, placeholder } = field;
</script>

<label for={key}
  >{label}<span class="required">{required ? '*' : ''}</span></label
>
<input
  name={key}
  placeholder={placeholder ?? ''}
  use:validators={validations ?? required ? [formRequired] : []}
/>
{#if required}
  <HintGroup for={key}>
    <Hint on="required"
      ><small class="text-orange-500">{hint ?? 'Required'}</small></Hint
    >
  </HintGroup>
{/if}
{#if !required && hint}
  <small class="text-blue-500">{hint}</small>
{/if}

<style lang="postcss">
  input {
    @apply block w-full rounded-md border border-gray-400 p-2;
  }
  label {
    @apply text-sm text-gray-700;
  }
  .required {
    @apply border-red-400;
  }
</style>
