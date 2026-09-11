<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="m4.552 1.496-.744-.208L4.168 0l3.55.99-1.805 3.317-1.175-.639.578-1.062a6.02 6.02 0 0 0 .277 10.907l-.536 1.225A7.37 7.37 0 0 1 .644 7.995a7.35 7.35 0 0 1 3.908-6.5m7.704 2.254a6 6 0 0 0-1.849-1.263l.536-1.225a7.37 7.37 0 0 1 4.413 6.743 7.35 7.35 0 0 1-3.908 6.5l.744.207-.36 1.288-3.55-.99 1.806-3.317 1.174.639-.578 1.062a6.02 6.02 0 0 0 1.572-9.644M8 5.994a2.006 2.006 0 1 0 0 4.012 2.006 2.006 0 0 0 0-4.012M4.656 8a3.344 3.344 0 1 1 6.688 0 3.344 3.344 0 0 1-6.688 0"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
