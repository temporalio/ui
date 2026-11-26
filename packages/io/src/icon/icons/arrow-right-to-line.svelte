<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M15 2.75V13.25V14H13.5V13.25V2.75V2H15V2.75ZM10.75 8.5625L6.5 12.5625L5.96875 13.0625L4.9375 11.96875L5.46875 11.46875L8.34375 8.75H5.75H1.75H1V7.25H1.75H5.75H8.34375L5.46875 4.5625L4.9375 4.0625L5.96875 2.96875L6.5 3.46875L10.75 7.46875L11.3438 8L10.75 8.5625Z"
  />
</IconSvgWrapper>
