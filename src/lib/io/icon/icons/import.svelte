<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.487 10.738v-.752H.984V16h14.032V9.986h-1.503v4.51H2.487zM8.533.532 8 0l-.533.532-4.009 4.01-.532.532L3.99 6.136l.532-.532 2.725-2.725v8.109h1.504V2.88l2.725 2.725.532.532 1.062-1.062-.532-.532-4.01-4.01z"
  />
</IconSvgWrapper>
