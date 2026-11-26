<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.748 15.978H7.252v-.552H0v-4.792h7.252v-.224H0V5.62h7.252v-.223H0V.605h7.252V.022h1.496zM16 14.05v1.496H8.89V14.05zm-14.504-.12h5.756v-1.8H1.496zm1.635-.116H2.093v-1.496H3.13zM16 12.882h-5.94v-1.496H16zm0-2.665H8.89V8.72H16zM1.496 8.914h5.756v-1.8H1.496zm1.635-.151H2.093V7.267H3.13zM16 7.553h-5.94V6.055H16zm0-2.666H8.89V3.39H16zM1.496 3.9h5.756V2.1H1.496zm1.635-.187H2.093V2.217H3.13zM16 2.223h-5.94V.726H16z"
  />
</IconSvgWrapper>
