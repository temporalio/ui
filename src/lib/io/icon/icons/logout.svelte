<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.262 2.487h.752V.984H0v14.032h6.014v-1.503h-4.51V2.487zm10.206 6.046L16 8l-.532-.533-4.01-4.009-.532-.532L9.864 3.99l.532.532 2.725 2.725H5.012v1.504h8.109l-2.725 2.725-.532.532 1.062 1.062.532-.532 4.01-4.01z"
  />
</IconSvgWrapper>
