<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M6.095 8 0 13.735V2.265zM1.5 10.265 3.906 8 1.5 5.734zM9.905 8 16 13.736V2.265zm4.595 2.265L12.094 8 14.5 5.735zM8.75 2v12h-1.5V2z"
  />
</IconSvgWrapper>
