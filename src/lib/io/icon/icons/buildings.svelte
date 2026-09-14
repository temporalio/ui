<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.5 1.5v13h-6v-13zM8.5 0H7v16h9V0zM6 4H0v12h6v-1.5H1.5v-9H6zm-1 6H3v2h2zm5.5 1h2V9h-2zM5 7H3v2h2zm5.5-4v2h2V3zm2 5V6h-2v2z"
  />
</IconSvgWrapper>
