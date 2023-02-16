<script lang="ts">
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import debounce from 'just-debounce';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let parameter: string;
  export let name: string;
  export let value: string;

  let _value = (parameter && $page.url.searchParams.get(parameter)) || value;

  const id = `${parameter || name}-filter`;
  const update = debounce(updateQueryParameters, 300);

  $: {
    update({
      parameter,
      value: _value,
      url: $page.url,
    });
  }
</script>

<div class="input-container focus-within:border-blue-700">
  <label for={id} class="hidden">{name}</label>
  <span><Icon name="search" class="flex items-center text-gray-700" /></span>
  <input
    type="search"
    class="block w-full focus:outline-none"
    placeholder={name}
    {id}
    bind:value={_value}
    on:keydown|stopPropagation
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
