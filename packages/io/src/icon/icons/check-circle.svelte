<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M8 16A8 8 0 1 0 8-.001 8 8 0 0 0 8 16m3.531-9.469L12.062 6 11 4.94l-.531.532L7 8.94 5.531 7.47 5 6.942 3.94 8l.532.531 2 2 .531.531.531-.53z"
  />
</IconSvgWrapper>
