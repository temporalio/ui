<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M.449 3.117 0 2.625l.98-.9.449.492L6.3 7.55l.413.45-.413.45-4.872 5.333-.449.492-.98-.9.449-.492L4.909 8zm6.47 9.772H16v1.333H6.254V12.89z"
  />
</IconSvgWrapper>
