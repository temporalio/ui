<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M0 8a8 8 0 1 0 16 0A8 8 0 0 0 0 8m7.25-4.25V8.4l.334.222 3 2 .625.415.832-1.246-.625-.416L8.75 7.6V3h-1.5z"
  />
</IconSvgWrapper>
