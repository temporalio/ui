<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.94 3.404h12.12V1.94H1.94zM1.94 6.068h12.12V4.604H1.94zM1.94 8.732h12.12V7.268H1.94zM1.94 11.396h12.12V9.932H1.94zM1.94 14.06h12.12V12.596H1.94zM16 14.061A1.94 1.94 0 0 1 14.06 16H1.94A1.94 1.94 0 0 1 0 14.06V1.94A1.94 1.94 0 0 1 1.94 0h12.12A1.94 1.94 0 0 1 16 1.94z"
  />
</IconSvgWrapper>
