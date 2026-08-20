<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.88 8.167q-.002-.78-.133-1.5H7.84v2.84h3.947a3.38 3.38 0 0 1-1.474 2.206v1.847h2.38c1.387-1.28 2.187-3.16 2.187-5.393"
  /><path
    fill="currentColor"
    d="M7.84 15.333c1.98 0 3.64-.653 4.853-1.773l-2.38-1.847c-.653.44-1.486.707-2.473.707-1.907 0-3.527-1.287-4.107-3.02h-2.44v1.893a7.33 7.33 0 0 0 6.547 4.04"
  /><path
    fill="currentColor"
    d="M3.733 9.393A4.4 4.4 0 0 1 3.5 8c0-.487.087-.953.233-1.393V4.713h-2.44C.793 5.7.507 6.813.507 8s.286 2.3.786 3.287l1.9-1.48z"
  /><path
    fill="currentColor"
    d="M7.84 3.587c1.08 0 2.04.373 2.807 1.093l2.1-2.1C11.473 1.393 9.82.667 7.84.667a7.32 7.32 0 0 0-6.547 4.046l2.44 1.894c.58-1.734 2.2-3.02 4.107-3.02"
  />
</IconSvgWrapper>
