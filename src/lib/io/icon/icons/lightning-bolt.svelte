<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m9.334 3 .335-1.5L10 0H3l-.834 7.5L2 9h5.5l-.322 1.5-.51 2.375L6 16l2.056-2.444L14 6.5v-2H9zm3.129 3-3.735 4.434.24-1.118.388-1.816H3.675l.669-6H8.13l-.594 2.675L7.131 6z"
  />
</IconSvgWrapper>
