<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1 2.75V2H2.5V2.75V13.25V14H1V13.25V2.75ZM5.21875 8.5625L4.65625 8L5.21875 7.46875L9.46875 3.46875L10.03125 2.96875L11.0312 4.0625L10.5 4.5625L7.625 7.25H10.25H14.25H15V8.75H14.25H10.25H7.625L10.5 11.46875L11.0312 11.96875L10.03125 13.0625L9.46875 12.5625L5.21875 8.5625Z"
  />
</IconSvgWrapper>
