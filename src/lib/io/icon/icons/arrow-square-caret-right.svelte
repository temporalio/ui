<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M13.5 2.5H2.5V13.5H13.5V2.5ZM15 1V2.5V13.5V15H13.5H2.5H1V13.5V2.5V1H2.5H13.5H15ZM7 4L11 8L7 12H6V4H7Z"
  />
</IconSvgWrapper>
