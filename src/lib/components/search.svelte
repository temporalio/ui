<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSearch } from '@fortawesome/free-solid-svg-icons';
  import Button from './button.svelte';

  export let placeholder = '';
  export let value = '';
  export let label = 'Search';
  export let name = 'query';
  export let icon = false;
  export let noButton = false;
  export let id = `${label.toLocaleUpperCase()}-input`;
</script>

<form
  on:submit|preventDefault
  class="flex items-center relative rounded-full border-2 focus-within:border-blue-700 transition-colors {noButton
    ? 'h-12'
    : ''}"
>
  {#if icon}
    <Icon
      icon={faSearch}
      scale={0.9}
      color="gray"
      class="flex items-center ml-4"
    />
  {/if}
  <label for={id} class="hidden">{label}</label>
  <input
    {id}
    type="text"
    class="w-full px-4 focus:outline-none rounded-l-full rounded-r-full"
    {name}
    {value}
    {placeholder}
    on:input
  />
  {#if !noButton}
    <div>
      <Button class="m-2">{label}</Button>
    </div>
  {/if}
</form>
