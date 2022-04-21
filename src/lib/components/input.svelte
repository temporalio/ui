<script lang="ts">
  import Icon from 'svelte-fa';

  import { faSearch } from '@fortawesome/free-solid-svg-icons';

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
      icon={faSearch}
      scale={0.9}
      color="gray"
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
    @apply border-2 text-base p-2 w-full h-10 rounded-lg inline-flex relative items-center box-border;
  }

  span {
    @apply mr-1;
  }
</style>
