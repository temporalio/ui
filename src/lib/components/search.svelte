<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Button from '$lib/holocene/button.svelte';

  export let placeholder = '';
  export let value = '';
  export let label = 'Search';
  export let name = 'query';
  export let icon = false;
  export let id = `${label.toLocaleUpperCase()}-input`;
</script>

<form
  on:submit|preventDefault
  class="relative flex items-center rounded-lg border-2 bg-white transition-colors focus-within:border-blue-700"
  role="search"
>
  {#if icon}
    <Icon name="search" class="ml-4 flex items-center text-gray-700" />
  {/if}
  <label for={id} class="hidden">{label}</label>
  <input
    {id}
    type="search"
    class="w-full rounded-l-lg px-4 focus:outline-none"
    {name}
    {value}
    {placeholder}
    autocomplete="off"
    on:input
    on:keydown|stopPropagation
  />
  <div>
    <Button class="m-2" type="submit">{label}</Button>
  </div>
</form>
