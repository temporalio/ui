<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M6.667 3.333a1.333 1.333 0 1 1 2.666 0 1.333 1.333 0 0 1-2.666 0m0 4.667a1.333 1.333 0 1 1 2.666 0 1.333 1.333 0 0 1-2.666 0m0 4.667a1.333 1.333 0 1 1 2.666 0 1.333 1.333 0 0 1-2.666 0"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
