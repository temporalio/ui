<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import type { ComponentProps, SvelteComponent } from 'svelte';
  export let defaultSlot;

  type $$Props = ComponentProps<Button> & { defaultSlot: string };
</script>

<Button {...$$props}>
  {defaultSlot}
</Button>
