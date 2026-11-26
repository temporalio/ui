<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.5 2.5h-13V4h13zm.5 3H0V1h16v4.5zM5 7h6v1.5H5zm8.5-.5H15V15H1V6.5h1.5v7h11z"
  />
</IconSvgWrapper>
