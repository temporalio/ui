<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.5 1.75V1H0v14h16v-1.5H1.5zm13.281 3.531.531-.531-1.062-1.06-.531.532L10 7.94 7.531 5.47 7 4.942l-.531.53-3 3-.531.532L4 10.06l.531-.53L7 7.058l2.469 2.47.531.53.531-.53z"
  />
</IconSvgWrapper>
