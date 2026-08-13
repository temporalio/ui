<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.5.5V2h2V0h1v2h2V0h1v2H14v2.5h2v1h-2v2h2v1h-2v2h2v1h-2V14h-2.5v2h-1v-2h-2v2h-1v-2h-2v2h-1v-2H2v-2.5H0v-1h2v-2H0v-1h2v-2H0v-1h2V2h2.5V0h1zM13 3H3v10h10zm-2 2H5v6h6zM5 4h7v8H4V4Z"
  />
</IconSvgWrapper>
