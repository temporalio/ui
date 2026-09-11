<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.4 10.75V9.125H0V1h10.4v8.125H5.6l-2 1.016zm2.65-2.691.25-.153h3.9V2.22h-8v5.687h2.4v.889zm1.35 3.097V9.937h1.2v1.22h3.075l.25.126 1.475.762v-.889h2.4V5.47h-3.6V4.25H16v8.125h-2.4V14l-1.2-.61-2-1.015h-4z"
  />
</IconSvgWrapper>
