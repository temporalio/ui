<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m15 4.06-.531.532-7.922 7.881-.528.528-.528-.528-3.96-3.94L1 8.005l1.06-1.063.53.528 3.429 3.413 7.39-7.356.532-.529z"
  />
</IconSvgWrapper>
