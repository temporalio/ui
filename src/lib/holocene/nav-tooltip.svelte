<script lang="ts">
  import { navOpen } from '$lib/stores/nav-open';
  
  import Tooltip from './tooltip.svelte';

  export let props = $$restProps;
</script>

<Tooltip hide={$navOpen} {...props}>
  <slot />
</Tooltip>
