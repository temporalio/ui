<script lang="ts">
  import MenuItem from '../primitives/menu/menu-item.svelte';

  export let label: string;
</script>

<MenuItem disabled>
  {label}
</MenuItem>
<slot />
