<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import debounce from 'just-debounce';
  import Icon from 'svelte-fa';
  import { faSearch } from '@fortawesome/free-solid-svg-icons';

  export let parameter: string;
  export let name: string;
  export let value: string;

  let _value = (parameter && $page.query.get(parameter)) || value;

  const id = `${parameter || name}-filter`;
  const update = debounce(updateQueryParameters, 300);

  $: {
    update({
      parameter,
      value: _value,
      query: $page.query,
      path: $page.path,
      goto,
    });
  }
</script>

<div class="input-container">
  <label for={id} class="hidden">{name}</label>
  <span
    ><Icon
      icon={faSearch}
      scale={0.9}
      color="gray"
      class="flex items-center"
    /></span
  >
  <input class="block w-full" placeholder={name} {id} bind:value={_value} />
</div>

<style lang="postcss">
  .input-container {
    @apply border-2 text-base p-2 w-full h-10 rounded-lg inline-flex relative items-center box-border;
  }

  span {
    @apply mr-1;
  }
</style>
