<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M16 1.778h-1.333v.825L1.333 6.239v-.906H0v5.334h1.333V9.76l3.267.892a2.667 2.667 0 1 0 5.13 1.4l4.937 1.344v.825H16zm-1.333 10.239L1.333 8.38v-.76l13.334-3.637zm-8.89-.461q.001-.299.12-.55l2.542.691a1.333 1.333 0 0 1-2.658-.144z"
  />
</IconSvgWrapper>
