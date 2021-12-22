<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let parameter: string;
  export let name: string;
  export let value: string;

  let _value = (parameter && $page.query.get(parameter)) || value;

  const id = `${parameter || name}-filter`;

  $: {
    updateQueryParameters({
      parameter,
      value: _value,
      query: $page.query,
      path: $page.path,
      goto,
    });
  }
</script>

<div class="flex flex-col items-start justify-center">
  <label for={id} class="hidden">{name}</label>
  <input
    class="block border-2 text-base p-2 w-full h-10 rounded-lg "
    placeholder={name}
    {id}
    bind:value={_value}
  />
</div>
