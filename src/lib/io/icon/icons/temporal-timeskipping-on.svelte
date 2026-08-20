<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M15.625 2.002h-.75a.376.376 0 0 0-.375.375v4.946q-.05-.058-.11-.106L8.64 2.233C7.998 1.699 7 2.145 7 3.002v3.874L1.64 2.233C.998 1.699 0 2.145 0 3.002V13c0 .856.997 1.306 1.64.769L7 9.094V13c0 .856.997 1.306 1.64.769l5.75-5.015q.06-.052.11-.106v4.977c0 .206.169.375.375.375h.75a.376.376 0 0 0 .375-.375V2.377a.376.376 0 0 0-.375-.375M1.5 11.9V4.098l4.488 3.887zm7 0V4.098l4.488 3.887z"
  />
</IconSvgWrapper>
