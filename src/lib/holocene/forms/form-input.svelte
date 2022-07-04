<script lang="ts">
  import {
    Hint,
    HintGroup,
    validators,
    required as formRequired,
  } from 'svelte-use-form';
  import type { FormField } from '$app/stores/schedules';

  export let field: FormField;
  const { key, label, validations, hint, required, placeholder } = field;
</script>

<label for={key}>{label}</label>
<input
  name={key}
  placeholder={required ? 'Required' : placeholder ?? ''}
  use:validators={validations ?? required ? [formRequired] : []}
/>
{#if required}
  <HintGroup for={key}>
    <Hint on="required"
      ><small class="text-gray-700">{hint ?? 'Required'}</small></Hint
    >
  </HintGroup>
{/if}

<style lang="postcss">
  input {
    @apply block w-full rounded-md border border-gray-400 p-2;
  }
  label {
    @apply text-sm text-gray-700;
  }
</style>
