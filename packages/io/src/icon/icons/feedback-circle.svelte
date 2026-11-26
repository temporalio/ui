<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M8 16A8 8 0 1 0 8-.001 8 8 0 0 0 8 16M4.225 8.972 5 9.747l3 3 3-3 .775-.775a2.47 2.47 0 0 0 .725-1.75v-.113a2.363 2.363 0 0 0-4.21-1.475L8 5.997l-.29-.363A2.363 2.363 0 0 0 3.5 7.11v.113c0 .656.26 1.284.725 1.75"
  />
</IconSvgWrapper>
