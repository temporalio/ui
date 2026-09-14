<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m12.06 7.998-.532.532-5.997 6-.531.53-1.06-1.062.532-.53 5.469-5.47L4.469 2.53l-.532-.532L5 .94l.531.531 6 5.997.531.531z"
  />
</IconSvgWrapper>
