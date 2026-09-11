<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M11.49.329A8.4 8.4 0 0 0 8.037.075C4.06.618 1 3.961 1 8c0 4.418 3.659 8 8.17 8a8.26 8.26 0 0 0 4.057-1.054A8 8 0 0 0 15 13.604a7 7 0 0 1-1.773.221c-.46 0-.912-.043-1.346-.128-3.213-.618-5.64-3.397-5.64-6.73 0-2.103.964-3.985 2.485-5.242q.219-.182.449-.343a7 7 0 0 1 2.32-1.06zM5.61 2.768A8.4 8.4 0 0 0 4.49 6.97c0 3.079 1.657 5.783 4.145 7.293C5.337 13.996 2.75 11.293 2.75 8c0-2.182 1.134-4.104 2.86-5.232"
  />
</IconSvgWrapper>
