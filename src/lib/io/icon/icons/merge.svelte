<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M2.5 1.5v2h2v-2zM1 0h5v5H4.287A3.25 3.25 0 0 0 7.5 7.75H10V6h5v5h-5V9.25H7.5c-1.256 0-2.4-.488-3.25-1.284V11H6v5H1v-5h1.75V5H1zm1.5 12.5v2h2v-2zm11-5h-2v2h2z"
  />
</IconSvgWrapper>
