<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import IconSvgWrapper from '../icon-svg-wrapper.svelte';

  const props: Omit<
    ComponentProps<typeof IconSvgWrapper>,
    'children'
  > = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.2 3v10H0V3zm5.248 2.292-.426.443-1.575 1.64h7.103l-1.575-1.64-.425-.443.85-.883.425.443 2.6 2.706.425.442-.425.443-2.6 2.708-.425.443-.848-.885.425-.443 1.576-1.64H4.45l1.575 1.64.425.443-.85.882-.425-.442-2.6-2.706L2.15 8l.425-.442 2.6-2.709.425-.443zM16 3.625V13h-1.2V3H16z"
  />
</IconSvgWrapper>
