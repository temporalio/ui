<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M8 16A8 8 0 1 0 8-.001 8 8 0 0 0 8 16m-1.25-5.5H6V12h4v-1.5H9V7H6v1.5h1.5v2zM9 6V4H7v2z"
  />
</IconSvgWrapper>
