<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M5.682 0h4.636v4.593H8.673v2.74h5.682v4.074H16V16h-4.635v-4.593h1.644v-2.74H8.673v2.74h1.645V16H5.682v-4.593h1.645v-2.74H2.99v2.74h1.644V16H0v-4.593h1.645V7.333h5.682v-2.74H5.682zm3.29 3.26V1.332H7.028V3.26zm-7.626 9.48v1.927H3.29V12.74zm5.682 0v1.927h1.944V12.74zm5.682 0v1.927h1.944V12.74z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
