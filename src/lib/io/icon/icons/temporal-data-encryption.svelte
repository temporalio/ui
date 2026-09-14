<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.748 4.11h4.678v1.495H8.748V8.46h4.678v1.495H8.748v2.612H16v1.496H8.748v1.915H7.252v-1.915H0V1.934h7.252V.022h1.496zm-7.252 8.457h5.756V3.43H1.496zM16 12.13h-5.94v-1.496H16zm0-4.35h-5.94V6.284H16zm0-4.35h-5.94V1.934H16z"
  />
</IconSvgWrapper>
