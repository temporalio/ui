<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';

  type T = $$Generic;

  export let checked: boolean = false;
  export let value: T;

  const dispatch = createEventDispatcher<{ select: { value: T } }>();

  function handleItemClick() {
    dispatch('select', { value });
  }
</script>

<MenuItem active={checked} on:click={handleItemClick}>
  <label class="flex w-full cursor-pointer items-center">
    <input {checked} class="mr-4" type="radio" {value} />
    <slot />
  </label>
</MenuItem>
