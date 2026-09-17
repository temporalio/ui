<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.75.75V0h-1.5v9.19L4.281 6.223 3.75 5.69 2.69 6.75l.532.531 4.247 4.25.531.531.531-.53 4.25-4.25.531-.532-1.062-1.06-.531.532L8.75 9.19zM4.025 9.5H0V16h16V9.5h-4.025l-1.5 1.5H14.5v3.5h-13V11h4.025zm9.475 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0"
  />
</IconSvgWrapper>
