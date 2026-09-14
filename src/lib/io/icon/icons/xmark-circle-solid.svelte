<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m4-11.2-.4.4L8.798 8l2.8 2.8.4.4-.798.8-.4-.4L8 8.798l-2.8 2.8-.4.4L4 11.2l.4-.4L7.202 8l-2.8-2.8-.4-.4L4.8 4l.4.4L8 7.202l2.8-2.8.4-.4z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
