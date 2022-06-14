<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import Button from './button.svelte';

  export let placeholder = '';
  export let value = '';
  export let label = 'Search';
  export let name = 'query';
  export let icon = false;
  export let id = `${label.toLocaleUpperCase()}-input`;
</script>

<form
  on:submit|preventDefault
  class="relative flex items-center rounded-lg border-2 transition-colors focus-within:border-blue-700"
>
  {#if icon}
    <Icon
      name="search"
      scale={0.9}
      stroke="gray"
      class="ml-4 flex items-center"
    />
  {/if}
  <label for={id} class="hidden">{label}</label>
  <input
    {id}
    type="text"
    class="w-full rounded-l-lg px-4 focus:outline-none"
    {name}
    {value}
    {placeholder}
    on:input
  />
  <div>
    <Button class="m-2">{label}</Button>
  </div>
</form>
