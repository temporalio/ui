<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M6.2 0v1.75h2.764V1L16 0v5L8.964 4v-.75H6.2v.831A3.506 3.506 0 0 1 8.964 7.5V16H1.93V7.5a3.506 3.506 0 0 1 2.764-3.419v-.803a4.27 4.27 0 0 0-3.34 2.363L0 4.984a5.77 5.77 0 0 1 4.693-3.212V0zM3.436 14.5h4.02V13h-4.02zm0-7v4h4.02v-4c0-1.103-.9-2-2.01-2-1.108 0-2.01.897-2.01 2"
  />
</IconSvgWrapper>
