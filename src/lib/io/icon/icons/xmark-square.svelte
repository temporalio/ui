<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.714 14.286V1.714h12.572v12.572zM0 16h16V0H0zm11.496-5.714-.607-.607L9.211 8l1.678-1.679.607-.607-1.21-1.21-.607.607L8 6.789 6.321 5.111l-.607-.607-1.21 1.21.607.607L6.789 8 5.111 9.679l-.607.607 1.21 1.21.607-.607L8 9.211l1.679 1.678.607.607z"
  />
</IconSvgWrapper>
