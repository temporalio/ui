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

<label class="checkbox {$$props.class}" class:disabled class:on-dark={onDark}>
  {#if label}
    <span class="label">
      {@html label}
    </span>
  {:else}
    &nbsp;
  {/if}
  <input
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
      <span class="dash" class:on-dark={onDark} />
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
    @apply relative block w-fit cursor-pointer select-none align-middle text-sm leading-6 text-primary;
  }

  .checkbox.on-dark {
    @apply text-white;
  }

  .label {
    /* 18px is the height of .checkmark - 16x16 box with 1px border on each side */
    @apply absolute left-6 flex h-[18px] items-center whitespace-nowrap;
  }

  input {
    @apply absolute top-0 left-0 h-0 w-0 opacity-0;
  }

  .checkmark {
    @apply absolute top-0 left-0 box-content h-4 w-4 cursor-pointer rounded-sm border border-gray-500 bg-white;
  }

  .checkmark.on-dark {
    @apply border-white bg-primary;
  }

  .dash {
    @apply absolute top-[7px] left-1 h-0 w-2 rounded border border-white bg-white;
  }

  .dash.on-dark {
    @apply border-white;
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

  .checkbox.disabled.on-dark .checkmark .dash {
    @apply opacity-80;
  }
</style>
