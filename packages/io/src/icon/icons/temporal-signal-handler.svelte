<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.742 16H7.248V5.615h1.494zM3.872 1.71a5.838 5.838 0 0 1 8.255 8.254l-1.056-1.056a4.343 4.343 0 1 0-6.142 0L3.872 9.964a5.84 5.84 0 0 1 0-8.255m1.98 1.979a3.04 3.04 0 0 1 4.297 4.296L9.092 6.928a1.543 1.543 0 1 0-2.182 0L5.852 7.985a3.04 3.04 0 0 1 0-4.296"
  />
</IconSvgWrapper>
