<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M7 8.45v2.328l2 1.6V8.45l.356-.419L14.46 2H1.541l5.103 6.031zM0 2V.5h16v2L10.5 9v6.5L9 14.3l-3.5-2.8V9L0 2.5z"
  />
</IconSvgWrapper>
