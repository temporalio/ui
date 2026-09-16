<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 2.75V4h.75L11 2 8.75 0H8v1.25H0v7.5h14.5v4.5H13V12H9v4h4v-1.25h3v-7.5H1.5v-4.5zM5 12v1.25H4V12H0v4h4v-1.25h1V16h.75L8 14l-2.25-2zm8.25-10.75h1.5v1.5h-1.5zM12 0v4h4V0zM2.75 13.25v1.5h-1.5v-1.5zm7.5 0h1.5v1.5h-1.5z"
  />
</IconSvgWrapper>
