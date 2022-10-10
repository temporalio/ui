<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import IntConditionals from './int-conditionals.svelte';

  export let id: string;
  export let value = '';
  export let conditional = '';
</script>

<div class="flex gap-2">
  <IntConditionals bind:conditional />
  <Input id={`${id}-filter`} placeholder={id} class="w-96" bind:value />
</div>
