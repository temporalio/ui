<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M15.998 15.998H.002V.002h15.996zm-14.496-1.5h12.996V1.502H1.502zm11.77-1.75H8V11.25h5.272zm-5.4-4.01-3.935 3.934-1.06-1.06L5.75 8.737 2.877 5.864l1.06-1.06z"
  />
</IconSvgWrapper>
