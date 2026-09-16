<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m9.866 9.45-.757-.119-.54.54-.628.629H5.5v2h-2v2h-2v-2.44l4.628-4.63.54-.54-.118-.757A4 4 0 1 1 9.866 9.45M8.5 12h.06l.218-.219.85-.85q.426.068.872.069a5.5 5.5 0 1 0-5.431-4.628l-4.85 4.847-.219.219V16h5v-2h2v-2zm3-6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
  />
</IconSvgWrapper>
