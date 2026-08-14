<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import Svg from '../svg.svelte';

  type Props = Omit<ComponentProps<typeof Svg>, 'viewBox' | 'fill'>;

  let props: Props = $props();
</script>

<Svg viewBox="0 0 18 18" fill="none" {...props}>
  <path
    d="M2.125 12V6L6.125 9.3913L2.125 12Z"
    stroke="currentColor"
    stroke-width="1.5"
  />
  <path
    d="M15.875 12V6L11.875 9.3913L15.875 12Z"
    stroke="currentColor"
    stroke-width="1.5"
  />
  <path d="M9 5L9 13" stroke="currentColor" stroke-width="1.5" />
</Svg>
