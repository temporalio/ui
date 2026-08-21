<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.5 14.5h-9v-3H4V16h12V4l-4-4H4v8h1.5V1.5H11V5h3.5zM9.281 6.719l-.531-.532L7.69 7.25l.532.531L9.44 9H0v1.5h9.44l-1.218 1.219-.531.531 1.059 1.06.531-.532 2.5-2.5.531-.531-.53-.531-2.5-2.5z"
  />
</IconSvgWrapper>
