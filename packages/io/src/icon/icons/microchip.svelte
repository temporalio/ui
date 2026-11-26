<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.75.75V2h1.5V0h1.5v2h1.5V0h1.5v2H14v2.25h2v1.5h-2v1.5h2v1.5h-2v1.5h2v1.5h-2V14h-2.25v2h-1.5v-2h-1.5v2h-1.5v-2h-1.5v2h-1.5v-2H2v-2.25H0v-1.5h2v-1.5H0v-1.5h2v-1.5H0v-1.5h2V2h2.25V0h1.5zM12.5 3.5h-9v9h9zm-3 3h-3v3h3zM6.5 5H11v6H5V5z"
  />
</IconSvgWrapper>
