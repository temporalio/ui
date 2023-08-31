<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import Button from '$lib/holocene/button.svelte';

  export let defaultSlot;

  type $$Props = ComponentProps<Button> & { defaultSlot: string };
</script>

<Button {...$$props}>
  {defaultSlot}
</Button>
