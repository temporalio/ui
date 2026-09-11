<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.6 1.958v-.625H7.4v2.5h-5v10.834h11.2V3.833h-5zM7.4 5.083h5v8.334H3.6V5.083zM1.6 7.167H0v5h1.6zm14.4 0h-1.6v5H16zM4.8 11.333v.834h1.6v-.834zm3.6 0H7.2v.834h1.6v-.834zm1.6 0h-.4v.834h1.6v-.834zM7 8c0-.276-.105-.541-.293-.737A.98.98 0 0 0 6 6.958a.98.98 0 0 0-.707.305C5.105 7.46 5 7.723 5 8s.105.541.293.737A.98.98 0 0 0 6 9.042a.98.98 0 0 0 .707-.305C6.895 8.54 7 8.277 7 8m3 1.042a.98.98 0 0 0 .707-.305C10.895 8.54 11 8.277 11 8s-.105-.541-.293-.737A.98.98 0 0 0 10 6.958a.98.98 0 0 0-.707.305C9.105 7.46 9 7.723 9 8s.105.541.293.737a.98.98 0 0 0 .707.305"
  />
</IconSvgWrapper>
