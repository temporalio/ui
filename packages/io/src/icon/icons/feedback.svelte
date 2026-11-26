<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 5.122 6.184 3.306a2.743 2.743 0 1 0-3.881 3.878L8 12.878l5.697-5.694a2.743 2.743 0 1 0-3.881-3.881l-.757.76zM8 15 1.244 8.244a4.241 4.241 0 0 1 3-7.244c1.125 0 2.203.447 3 1.244L8 3l.756-.756a4.25 4.25 0 0 1 3-1.24 4.24 4.24 0 0 1 3 7.24z"
  />
</IconSvgWrapper>
