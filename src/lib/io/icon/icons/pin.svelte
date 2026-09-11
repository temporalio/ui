<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m10.269 6.819.56.406a4.6 4.6 0 0 1 1.308 1.55c.16.303.25.553.304.725H8.75V6h-1.5v3.5H3.544a4 4 0 0 1 .322-.816 4.26 4.26 0 0 1 1.287-1.487l.581-.406.053-.707.35-4.584h3.726l.356 4.631.053.688zM8.75 11H14V9.75q.001-.106-.022-.25c-.128-.806-.812-2.425-2.265-3.484L11.366 1.5H13V0H3v1.5h1.634l-.343 4.469C2.816 7.003 2.13 8.613 2.019 9.5q-.02.136-.019.25V11h5.25v5h1.5z"
  />
</IconSvgWrapper>
