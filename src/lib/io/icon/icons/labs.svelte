<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M9.5 6.719V1.5h-3v5.656l-.25.375L4.719 10h6.531L9.719 7.531 9.5 7.156zM11 1.5v5.219l4 6.5V16H1v-2.781l4-6.5V1.5H4V0h8v1.5z"
  />
</IconSvgWrapper>
