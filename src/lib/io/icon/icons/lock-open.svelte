<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M9.5 4v2H13v10H0V6h8V4c0-2.187 1.781-4 4-4 2.188 0 4 1.813 4 4v3h-1.5V4c0-1.375-1.125-2.5-2.5-2.5A2.487 2.487 0 0 0 9.5 4m-8 3.5v7h10v-7z"
  />
</IconSvgWrapper>
