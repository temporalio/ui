<script lang="ts">
  import {
    validators,
    required as formRequired,
    number,
    Validator,
  } from 'svelte-use-form';
  import type { FormField } from '$holocene/forms';

  export let field: FormField;
  export let suffix: string;

  const { key, placeholder } = field;
</script>

<div class="flex gap-0">
  <input name={key} placeholder={placeholder ?? ''} data-lpignore="true" />
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
    @apply block w-full rounded-tr-md rounded-br-md border border-l-0 border-gray-900 bg-gray-100 p-2;
  }
  label {
    @apply text-sm text-gray-700;
  }
  .required {
    @apply border-red-400;
  }
</style>
