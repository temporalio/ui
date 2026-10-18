<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1 2.25h8.6s-.1.398-.1.75.1.75.1.75H1zm2 5h10v1.5H3zm7 5v1.5H6v-1.5z"
  /><path
    fill="#3E63DD"
    d="M10.813 4.25A2.53 2.53 0 0 0 13 5.5c.875 0 1.688-.469 2.156-1.25.438-.75.438-1.719 0-2.5C14.687 1 13.875.5 13 .5c-.906 0-1.719.5-2.187 1.25-.438.781-.438 1.75 0 2.5"
  />
</IconSvgWrapper>
