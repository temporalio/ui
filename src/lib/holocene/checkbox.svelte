<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$holocene/icon/icon.svelte';
  export let id: string = '';
  export let checked = false;
  export let label: string = null;
  export let onDark = false;
  export let indeterminate = false;
  export let disabled = false;

  const dispatch = createEventDispatcher<{ change: { checked: boolean } }>();

  const handleChange = (event) => {
    dispatch('change', { checked: event.target.checked });
  };
</script>

<label
  on:click
  class="checkbox {$$props.class}"
  class:disabled
  class:on-dark={onDark}
>
  <span class="label">
    {#if label}
      {@html label}
    {:else}
      &nbsp;
    {/if}
  </span>
  <input
    on:click|stopPropagation
    on:change={handleChange}
    {id}
    type="checkbox"
    bind:checked
    {indeterminate}
    {disabled}
    class:indeterminate
  />
  <span class="checkmark" class:on-dark={onDark}>
    {#if indeterminate}
      <Icon class="absolute top-0 left-0 h-4 w-4" name="hyphen" />
    {:else if checked}
      <Icon
        class="absolute top-0 left-0 h-4 w-4"
        name="checkmark"
        strokeWidth={3}
      />
    {/if}
  </span>
</label>

<style lang="postcss">
  .checkbox {
    @apply flex w-fit cursor-pointer select-none items-center text-sm leading-6 text-primary;
  }

  .checkbox.on-dark {
    @apply text-white;
  }

  .label {
    @apply ml-6 flex items-center whitespace-nowrap;
  }

  input {
    @apply absolute top-0 left-0 h-0 w-0 opacity-0;
  }

  .checkmark {
    @apply absolute box-content h-4 w-4 cursor-pointer rounded-sm border border-gray-500 bg-white;
  }

  .checkmark.on-dark {
    @apply border-white bg-primary;
  }

  input:checked + .checkmark,
  input.indeterminate + .checkmark {
    @apply bg-primary text-white;
  }

  .checkbox.disabled,
  .checkbox.disabled .checkmark {
    @apply cursor-default;
  }

  .checkbox.disabled.on-dark {
    @apply text-opacity-80;
  }

  .checkbox.disabled:not(.on-dark) .checkmark {
    @apply bg-opacity-50;
  }

  .checkbox.disabled.on-dark .checkmark {
    @apply border-opacity-80 text-opacity-80;
  }
</style>
