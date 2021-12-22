<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let id: string;
  export let name: string;
  export let value: string;

  let _value = (id && $page.query.get(id)) || value;

  $: {
    updateQueryParameters({
      parameter: id,
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
