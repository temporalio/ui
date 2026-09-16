<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.75 11H14V9.75q.001-.106-.022-.25c-.128-.806-.812-2.425-2.265-3.484L11.366 1.5H13V0H3v1.5h1.634l-.343 4.469C2.816 7.003 2.13 8.613 2.019 9.5q-.02.136-.019.25V11h5.25v5h1.5z"
  />
</IconSvgWrapper>
