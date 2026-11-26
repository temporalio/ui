<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M13.675 4.825 12.5 6v2.5h1.981a6.501 6.501 0 1 1-12.74-2.26L3 7.5h1.5L6 9v2l1 1v1.5h2v-1l2-2V8H7L6 7V6h2.5V5l-1-1v-.5l1-1v-.981a6.5 6.5 0 0 1 5.175 3.306M8 16A8 8 0 1 0 8-.001 8 8 0 0 0 8 16"
  />
</IconSvgWrapper>
