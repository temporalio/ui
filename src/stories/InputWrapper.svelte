<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import type { ComponentProps } from 'svelte';
  export let defaultSlot;

  type $$Props = ComponentProps<Input> & { defaultSlot: string };

  // Weird and awful
  let typedProps = $$props as ComponentProps<Input>;
</script>

<Input {...typedProps}>
  {defaultSlot}
</Input>
