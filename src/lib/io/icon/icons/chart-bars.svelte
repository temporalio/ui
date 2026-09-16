<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.5 1v12.5H16V15H0V1zM6 7v4H4.5V7zm3-2.25V11H7.5V4H9zM12 6v5h-1.5V6zm3-3.25V11h-1.5V2H15z"
  />
</IconSvgWrapper>
