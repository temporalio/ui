<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 13.575 1.714 7.289V1.714H7.29L13.575 8zm6.79-6.786L8 0H0v8l6.79 6.79L8 16l1.21-1.21 5.58-5.58L16 8zM4 5.143a1.143 1.143 0 1 0 0-2.286 1.143 1.143 0 0 0 0 2.286"
  />
</IconSvgWrapper>
