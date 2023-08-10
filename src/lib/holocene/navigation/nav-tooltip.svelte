<script lang="ts">
  import { navOpen } from '$lib/stores/nav-open';

  import Tooltip from '../tooltip.svelte';

  export let props = $$restProps;
  export let text = $$restProps.text;
</script>

<Tooltip hide={$navOpen} {text} {...props}>
  <slot />
</Tooltip>
