<script>import { Hint, HintGroup, validators, required as formRequired, } from 'svelte-use-form';
export let field;
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
  <small class="text-gray-500">{hint}</small>
{/if}

<style>
  input {
    display: block;
    width: 100%;
    border-radius: 0.375rem;
    border-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(161 161 170 / var(--tw-border-opacity));
    padding: 0.5rem
}
  label {
    font-size: 0.875rem;
    line-height: 1.25rem;
    --tw-text-opacity: 1;
    color: rgb(63 63 70 / var(--tw-text-opacity))
}
  .required {
    --tw-border-opacity: 1;
    border-color: rgb(248 113 113 / var(--tw-border-opacity))
}</style>
