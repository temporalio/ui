<script lang="ts">
  import { navOpen } from '$lib/stores/nav-open';
  import Tooltip from './tooltip.svelte';
</script>

<Tooltip hide={$navOpen} {...$$restProps}>
  <slot />
</Tooltip>
