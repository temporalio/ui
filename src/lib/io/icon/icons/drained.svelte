<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M10 16v-1.5h1.5v-1H10V12H9v1.5H7.5v1H9V16zm-2.125-4.312a4.6 4.6 0 0 1-1.25-.75A4.42 4.42 0 0 1 5 7.5C5 5 7 3 9.5 3c.156 0 .344 0 .5.031.5.031.969.188 1.406.375a6 6 0 0 0-.844-1.312C9.439.813 7.813 0 6 0 2.688 0 0 2.688 0 6c0 3.313 2.688 6 6 6 .094 0 .219-.031.313-.031a6.6 6.6 0 0 0 1.562-.281m-2.687-.75C2.813 10.53 1 8.468 1 6c0-2.781 2.219-5 5-5 1.125 0 2.188.375 3 1-2.812.25-5 2.594-5 5.5 0 1.281.438 2.469 1.188 3.438M13.5 11V9H16V8h-2.5V5.5h-1V8H10v1h2.5v2.5h1z"
  />
</IconSvgWrapper>
