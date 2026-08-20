<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m7.998 12.06.532-.532 6-5.997.53-.531-1.062-1.06-.532.532L7.998 9.94 2.53 4.469l-.532-.532L.94 5l.531.531 5.997 6 .531.531z"
  />
</IconSvgWrapper>
