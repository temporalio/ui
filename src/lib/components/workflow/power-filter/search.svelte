<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';

  type Props = {
    query: string;
  };
  let { query = $bindable() }: Props = $props();
</script>

<Input
  id="power-filter-query"
  type="search"
  label="Search"
  labelHidden
  placeholder="failed workflows in the last 15 minutes"
  bind:value={query}
  class="flex-grow gap-0"
  inputClass="border-none h-8"
/>
