<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  export let id: string;
  export let label: string;
  export let value: string;
  export let placeholder = label;
  export let name = id;
</script>

<div class="input-container focus-within:border-blue-700">
  <label for={id} class="hidden">{label}</label>
  <span
    ><Icon
      name="search"
      scale={0.9}
      stroke="gray"
      class="flex items-center"
    /></span
  >
  <input
    class="block w-full focus:outline-none"
    {placeholder}
    {id}
    {name}
    bind:value
    on:input
    on:change
  />
</div>

<style lang="postcss">
  .input-container {
    @apply relative box-border inline-flex h-10 w-full items-center rounded-lg border-2 p-2 text-base;
  }

  span {
    @apply mr-1;
  }
</style>
