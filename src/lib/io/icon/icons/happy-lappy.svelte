<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M6 1.5H4v3h2zm6 0h-2v3h2zm-8 9H2v2h2zm10 0h-2v2h2zm-2 2H4v2h8zm-10-4H0v2h2zm14 0h-2v2h2z"
  />
</IconSvgWrapper>
