<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m7.467 15.469.531.531.532-.531 4.25-4.25.53-.531-1.062-1.06-.53.531-2.97 2.97V0h-1.5v13.128L4.28 10.16l-.532-.53-1.059 1.059.531.53z"
  />
</IconSvgWrapper>
