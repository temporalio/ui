<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m8.719 6.938 4.395-2.196-2.024-.306.095-.64.093-.636L16 3.874l-1.575 4.427-.617-.218-.618-.217.732-2.06L9.53 8l5.532 2.763-.588 1.174-5.755-2.875V15H7.404V9.062l-4.553 2.274 2.06.312-.096.638-.093.638L0 12.209l1.575-4.427.617.218.619.217-.724 2.033L6.593 8 1.062 5.237l.587-1.174 5.755 2.875V1H8.72z"
  />
</IconSvgWrapper>
