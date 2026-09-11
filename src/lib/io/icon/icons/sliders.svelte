<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.5 12.5h2v-2h-2zM0 14V9h5v1.75h11v1.5H5V14zm.75-8.75H0v-1.5h11V2h5v5h-5V5.25zM12.5 3.5v2h2v-2z"
  />
</IconSvgWrapper>
