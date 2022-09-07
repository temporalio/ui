<script>import MenuItem from '../primitives/menu/menu-item.svelte';
export let label;
</script>

<MenuItem disabled>
  {label}
</MenuItem>
<slot />
