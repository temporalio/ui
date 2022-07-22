<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$holocene/icon/index.svelte';
  export let id: string;
  export let checked = false;
  export let label = '&nbsp;';
  export let onDark = false;
  export let indeterminate = false;

  const dispatch = createEventDispatcher();

  const handleChange = (event) => {
    dispatch('change', { checked: event.target.checked });
  };
</script>

<label class="checkbox {$$props.class}" class:on-dark={onDark}>
  {@html label}
  <input
    on:change={handleChange}
    {id}
    type="checkbox"
    bind:checked
    {indeterminate}
    class:indeterminate
  />
  <span class="checkmark" class:on-dark={onDark}>
    {#if checked}
      <Icon
        class="absolute top-0 left-0 h-4 w-4"
        name="checkMark"
        stroke="currentcolor"
        strokeWidth="3"
      />
    {:else if indeterminate}
      <span class="dash" class:on-dark={onDark} />
    {/if}
  </span>
</label>

<style lang="postcss">
  .checkbox {
    @apply relative block w-fit cursor-pointer select-none gap-1 pl-7 align-middle text-sm leading-6 text-primary;
  }

  .checkbox.on-dark {
    @apply text-white;
  }

  input {
    @apply absolute h-0 w-0 opacity-0 opacity-0;
  }

  .checkmark {
    @apply absolute top-[3px] left-0.5 box-content h-4 w-4 cursor-pointer rounded-sm border border-primary bg-white;
  }

  .checkmark.on-dark {
    @apply border-white;
  }

  .dash {
    @apply absolute top-[7px] left-1 h-0 w-2 rounded border border-white;
  }

  .dash.on-dark {
    @apply border-white;
  }

  input:checked + .checkmark,
  input.indeterminate + .checkmark {
    @apply bg-primary text-white;
  }
</style>
