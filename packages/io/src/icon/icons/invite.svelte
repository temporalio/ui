<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M7.6 4.75c0-.71-.4-1.371-1-1.752a2.01 2.01 0 0 0-2 0c-.625.38-1 1.041-1 1.752 0 .736.375 1.396 1 1.777.6.356 1.375.356 2 0 .6-.38 1-1.04 1-1.777m-5.975 8.531h7.95L8.7 10.437H2.475zM9.6 9.22l1.225 4.062.375 1.219H0l.35-1.219L1.6 9.22h8M5.6 1.5c1.125 0 2.175.635 2.75 1.625a3.28 3.28 0 0 1 0 3.25A3.16 3.16 0 0 1 5.6 8c-1.15 0-2.2-.61-2.775-1.625a3.28 3.28 0 0 1 0-3.25C3.4 2.135 4.45 1.5 5.6 1.5m7 8.531V7.797h-2.2V6.578h2.2V4.343h1.2v2.235H16v1.219h-2.2v2.235z"
  />
</IconSvgWrapper>
