<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M3.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0m10.16-2A6.004 6.004 0 0 0 2.34 4H1.5v4h.84c.191.54.457 1.044.785 1.5H2.5l-1.153 5L1 16h5v-2h1v2h8l-.347-1.5-1.153-5h-.625c.328-.456.594-.96.784-1.5h.841V4zm-2.16 9h-7v1.5H2.884l.81-3.5h.987c.95.631 2.09 1 3.319 1a6 6 0 0 0 3.319-1h.987l.807 3.5H11.5zm-3-4a3 3 0 0 0 3-3V5l-1-1h-5l-1 1v1a3 3 0 0 0 3 3zM7 5l.5 1 1 .5-1 .5L7 8l-.5-1-1-.5 1-.5zm2 9.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0"
  />
</IconSvgWrapper>
