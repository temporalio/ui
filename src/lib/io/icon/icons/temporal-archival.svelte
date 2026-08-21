<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m13.505.292 2.34 3.041.155.202V8.1h-1.133l-.038 7.157-.004.744H1.165l.004-.752.038-7.15H0V3.536l.155-.202L2.495.292 2.718 0H13.28zM2.669 14.504h10.669l.033-6.386H2.702zm-1.173-7.9h13.008V4.537H1.496zm.77-3.563h11.466l-1.188-1.545H3.455z"
  />
</IconSvgWrapper>
