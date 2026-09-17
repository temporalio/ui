<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M11.498 6.5a5 5 0 0 0-8.534-3.536 5 5 0 0 0 7.07 7.072A5 5 0 0 0 11.498 6.5m-.966 5.097A6.498 6.498 0 0 1 0 6.5a6.498 6.498 0 1 1 12.998 0 6.47 6.47 0 0 1-1.403 4.034l3.874 3.875.531.532L14.938 16l-.531-.531-3.875-3.875z"
  />
</IconSvgWrapper>
