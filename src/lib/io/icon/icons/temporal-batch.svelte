<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m14.977 11.475-6.584 4.141-.399.251-.4-.25-6.583-4.142.8-1.27 6.183 3.89 6.184-3.89zm0-2.785-6.584 4.142-.399.25-.4-.25L1.012 8.69l.8-1.269 6.183 3.89 6.184-3.89zM8.398.253l6.59 4.137L16 5.025l-1.012.635-6.59 4.137-.398.25-.4-.25L1.012 5.66 0 5.025l1.011-.635L7.601.253 8 .002zM2.82 5.024l5.179 3.252 5.18-3.252-5.18-3.252z"
  />
</IconSvgWrapper>
