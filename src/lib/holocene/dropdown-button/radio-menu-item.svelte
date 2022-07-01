<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let checked: boolean = false;
  export let value: string;
  export let name: string;

  const dispatch = createEventDispatcher<{ click: { value: string } }>();

  function handleItemClick() {
    dispatch('click', { value });
  }
</script>

<div class:checked class="flex items-center" on:click={handleItemClick}>
  <input {checked} class="mr-4" type="radio" {name} {value} id={value} />
  <label class="w-full cursor-pointer p-2" for={value}><slot /></label>
</div>

<style lang="postcss">
  .checked {
    @apply text-blue-700;
  }
</style>
