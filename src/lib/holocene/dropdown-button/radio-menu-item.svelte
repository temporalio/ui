<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import MenuItem from '../primatives/menu/menu-item.svelte';

  export let checked: boolean = false;
  export let value: string;
  export let name: string;

  const dispatch = createEventDispatcher<{ select: { value: string } }>();

  function handleItemClick() {
    dispatch('select', { value });
  }
</script>

<MenuItem active={checked} on:click={handleItemClick}>
  <input {checked} class="mr-4" type="radio" {name} {value} id={value} />
  <label class="w-full cursor-pointer" for={value}><slot /></label>
</MenuItem>
