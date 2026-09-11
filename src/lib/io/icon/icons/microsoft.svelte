<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M.116 0h7.671v7.784H.116zm0 8.216h7.671V16H.116zM8.213 0h7.672v7.784H8.212zm0 8.216h7.672V16H8.212z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
