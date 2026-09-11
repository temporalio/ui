<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.333 3.5v9h13.334v-9zM0 2h16v12H0zm11.556 8v1.5H4.444V10zM2.889 7.25h1.333v1.5H2.89zm1.333-2.5v1.5H2.89v-1.5zm.89 2.5h1.332v1.5H5.111zm1.332-2.5v1.5H5.111v-1.5zm.89 2.5h1.333v1.5H7.333zm1.333-2.5v1.5H7.333v-1.5zm.889 2.5h1.333v1.5H9.556zm1.333-2.5v1.5H9.556v-1.5zm.889 2.5h1.333v1.5h-1.333zm1.333-2.5v1.5h-1.333v-1.5z"
  />
</IconSvgWrapper>
