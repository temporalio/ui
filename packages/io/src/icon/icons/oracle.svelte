<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14 8a3 3 0 0 0-3-3H5a3 3 0 0 0 0 6h6a3 3 0 0 0 3-3m2 0a5 5 0 0 1-5 5H5A5 5 0 1 1 5 3h6a5 5 0 0 1 5 5"
  />
</IconSvgWrapper>
