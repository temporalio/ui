<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import KeywordConditionals from './keyword-conditionals.svelte';

  export let id: string;
  export let label: string = '';
  export let value = '';
  export let conditional = '';
</script>

<div class="flex gap-2">
  <KeywordConditionals bind:conditional />
  <Input
    icon="search"
    id="{id}-filter"
    thin
    placeholder={label}
    class="w-96"
    bind:value
  />
</div>
