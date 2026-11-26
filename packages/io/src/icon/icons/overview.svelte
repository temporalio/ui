<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.34 1.735V7.43h3.087V1.735zM.797.025H6.97V9.14H.797V.024m9.776 8.545v5.695h3.087V8.57zM9.029 6.86h6.174v9.115H9.03zm-3.602 5.127H2.34v2.278h3.087zM2.34 10.278h4.631v5.697H.797v-5.697zm8.233-8.543v2.278h3.087V1.735zM9.029.025h6.174v5.697H9.03z"
  />
</IconSvgWrapper>
