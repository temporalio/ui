<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m3.94 8.001.532-.53 5.997-6L11 .938 12.06 2l-.529.532L6.06 8l5.472 5.47.531.53L11 15.062l-.531-.531-6-5.997L3.937 8z"
  />
</IconSvgWrapper>
