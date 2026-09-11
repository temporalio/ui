<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M7.25 6.786V0h1.5v6.786l6.579-3.285L16 4.843 9.679 8 16 11.157l-.671 1.342L8.75 9.214V16H7.249V9.214L.672 12.499 0 11.157 6.321 8 0 4.843.672 3.5z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
