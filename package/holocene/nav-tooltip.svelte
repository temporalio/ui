<script>import { navOpen } from '../stores/nav-open';
import Tooltip from './tooltip.svelte';
</script>

<Tooltip hide={$navOpen} {...$$restProps}>
  <slot />
</Tooltip>
