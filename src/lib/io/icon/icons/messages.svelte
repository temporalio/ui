<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m2.4 11.2 1.2-.6 2-1h4.8v-8H0v8h2.4zm2.663-2.672-1.463.73V8.4H1.2V2.8h8v5.6H5.318l-.253.127zM6.4 11.6v1.2h4l2 1 1.2.6v-1.6H16v-8h-4.8V6h3.6v5.6h-2.4v.857l-1.463-.732-.255-.125H7.6v-1.2H6.4z"
  />
</IconSvgWrapper>
