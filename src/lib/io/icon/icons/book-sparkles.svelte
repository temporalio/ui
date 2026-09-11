<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1 2.75A2.75 2.75 0 0 1 3.75 0H15v12.5h-1v2h1V16H3.5a2.5 2.5 0 0 1-2.487-2.75H1zM2.5 13.5a1 1 0 0 0 1 1h9v-2h-9a1 1 0 0 0-1 1m0-2.29a2.5 2.5 0 0 1 1-.21h10V1.5H3.75c-.69 0-1.25.56-1.25 1.25zM6 3.5l.5-1 .5 1L8 4l-1 .5-.5 1-.5-1L5 4zm3.25 3.25L10 5l.75 1.75 1.75.75-1.75.75L10 10l-.75-1.75L7.5 7.5z"
  />
</IconSvgWrapper>
