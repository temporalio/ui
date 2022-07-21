<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$holocene/icon/index.svelte';
  export let id: string;
  export let checked = false;
  export let label = '';
  export let onDark = false;

  const dispatch = createEventDispatcher();

  const handleChange = (event) => {
    dispatch('change', { checked: event.target.checked });
  };
</script>

<label class="checkbox {$$props.class}" class:on-dark={onDark}>
  {label}
  <input on:change={handleChange} {id} type="checkbox" bind:checked />
  <span class="checkmark" class:on-dark={onDark}>
    {#if checked}
      <Icon
        class="absolute top-[1px] left-[1px] h-4 w-4"
        name="checkMark"
        stroke="currentcolor"
        strokeWidth="3"
      />
    {/if}
  </span>
</label>

<style lang="postcss">
  .checkbox {
    @apply relative block w-fit cursor-pointer select-none gap-1 pl-8 align-middle text-sm leading-6 text-primary;
  }

  .checkbox.on-dark {
    @apply text-white;
  }

  input {
    @apply absolute h-0 w-0 opacity-0 opacity-0;
  }

  .checkmark {
    @apply absolute top-0.5 left-0.5 h-5 w-5 cursor-pointer rounded-sm border border-primary bg-white;
  }

  input:checked + .checkmark {
    @apply bg-primary text-white;
  }

  input:checked + .checkmark.on-dark {
    @apply bg-white text-primary;
  }
</style>
