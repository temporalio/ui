<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M10.75 12.499h5.248v1.5H10.75v1.999H5.752v-2H.002v-1.5h5.75V11h4.998zm-3.499 2h2v-2h-2zm-2.25-7.242h10.997v1.5H5v1.742H.002V5.501h4.999zM1.5 9h2V7h-2zm9.25-7.307h5.247v1.5H10.75V5H5.752V3.193H.002v-1.5h5.75V.002h4.998zm-3.5 1.808h2v-2h-2z"
  />
</IconSvgWrapper>
