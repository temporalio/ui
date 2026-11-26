<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m8.401.257 7.25 4.623.345.22v5.8l-.345.22-7.25 4.624L8 16l-.402-.257L.349 11.12l-.345-.221V5.1l.345-.22L7.598.257 8 0zm-6.277 10.22 5.128 3.272v-2.835L4.375 8.91zm6.623.437v2.835l5.128-3.27-2.252-1.57zM5.683 7.999 8 9.612 10.315 8 8 6.386zm7.248 0 1.57 1.094V6.907zM1.5 9.093 3.069 8l-1.57-1.092zm.625-3.571L4.376 7.09l2.877-2.004V2.248zm6.623-.436 2.876 2.004 2.252-1.568-5.128-3.273z"
  />
</IconSvgWrapper>
