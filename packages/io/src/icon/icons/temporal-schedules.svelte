<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 0a8 8 0 1 1-.002 16.002A8 8 0 0 1 8 0m0 1.5a6.501 6.501 0 0 0 0 13 6.5 6.5 0 0 0 0-13m.186 6.602 2.394 1.652-.852 1.235L7.01 9.113l-.324-.224V4.934h1.5z"
  />
</IconSvgWrapper>
