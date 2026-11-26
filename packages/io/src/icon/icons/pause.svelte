<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M4.5 3.5v9H6v-9zM3 2h4.5v12H3zm7 1.5v9h1.5v-9zM8.5 2H13v12H8.5z"
  />
</IconSvgWrapper>
