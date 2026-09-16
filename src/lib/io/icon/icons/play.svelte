<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m2 1 1.5.875 9 5.281L14 8l-1.5.875-9 5.25L2 15V1m1.5 2.625v8.781L11 8z"
  />
</IconSvgWrapper>
