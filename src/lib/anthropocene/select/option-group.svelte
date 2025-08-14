<script lang="ts">
  import MenuItem from '$lib/anthropocene/menu/menu-item.svelte';

  export let label: string;
</script>

<MenuItem disabled>
  {label}
</MenuItem>
<slot />
