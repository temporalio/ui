<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M14.267 7.151a10.3 10.3 0 0 1-3.236-2.183A10.26 10.26 0 0 1 8.356.276a.366.366 0 0 0-.71 0 10.3 10.3 0 0 1-2.675 4.692A10.3 10.3 0 0 1 .278 7.644a.365.365 0 0 0 0 .71q.745.187 1.456.492a10.3 10.3 0 0 1 3.237 2.183 10.26 10.26 0 0 1 2.676 4.693.365.365 0 0 0 .709 0q.187-.747.492-1.457a10.3 10.3 0 0 1 2.183-3.236 10.27 10.27 0 0 1 4.693-2.676.366.366 0 0 0 0-.709 9.6 9.6 0 0 1-1.457-.493"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
