<script>import { createEventDispatcher } from 'svelte';
import MenuItem from '$holocene/primitives/menu/menu-item.svelte';
export let checked = false;
export let value;
export let name;
const dispatch = createEventDispatcher();
function handleItemClick() {
    dispatch('select', { value });
}
</script>

<MenuItem active={checked} on:click={handleItemClick}>
  <input {checked} class="mr-4" type="radio" {name} {value} id={value} />
  <label class="w-full cursor-pointer" for={value}><slot /></label>
</MenuItem>
