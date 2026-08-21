<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.6 0h4.8l.225.334L12.069 2.5H15V4h-1.113L13 16H3L2.112 4H1V2.5h2.931L5.375.334zm.138 2.5h4.53l-.668-1H6.4l-.666 1zM3.616 4l.778 10.5h7.212L12.384 4z"
  />
</IconSvgWrapper>
