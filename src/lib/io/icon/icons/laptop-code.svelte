<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.8 3.6h10.4v6h1.2V2.4H1.6v7.2h1.2zm-1.502 8h13.405l-.8.8H2.097zM16 12v-1.6H0V12l1.6 1.6h12.8zM7.025 6.025 7.45 5.6l-.85-.847-.425.425-1.2 1.2-.425.425.425.425 1.2 1.2.425.425L7.447 8l-.425-.425-.775-.775.775-.775zm2.8-.85L9.4 4.75l-.848.85.425.425.775.775-.775.775L8.552 8l.848.848.425-.425 1.2-1.2.425-.425-.425-.425-1.2-1.2z"
  />
</IconSvgWrapper>
