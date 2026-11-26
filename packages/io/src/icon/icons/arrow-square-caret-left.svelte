<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.5 13.5H13.5V2.5H2.5V13.5ZM1 15V13.5V2.5V1H2.5H13.5H15V2.5V13.5V15H13.5H2.5H1ZM9 12L5 8L9 4H10V12H9Z"
  />
</IconSvgWrapper>
