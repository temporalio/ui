<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M7.6 4.667c0-.553-.211-1.083-.586-1.473A1.96 1.96 0 0 0 5.6 2.583c-.53 0-1.039.22-1.414.611-.375.39-.586.92-.586 1.473 0 .552.211 1.082.586 1.473.375.39.884.61 1.414.61s1.039-.22 1.414-.61A2.13 2.13 0 0 0 7.6 4.667m-5.975 8.75h7.95L8.712 10.5H2.488ZM9.6 9.25l1.23 4.167.37 1.25H0l.37-1.25L1.6 9.25h4Zm-4-7.917c.849 0 1.663.352 2.263.977S8.8 3.783 8.8 4.667s-.337 1.732-.937 2.357S6.449 8 5.6 8a3.14 3.14 0 0 1-2.263-.976A3.4 3.4 0 0 1 2.4 4.667c0-.884.337-1.732.937-2.357A3.14 3.14 0 0 1 5.6 1.333m7 8.75V7.791h-2.2v-1.25h2.2V4.249h1.2v2.292H16v1.25h-2.2v2.292z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
