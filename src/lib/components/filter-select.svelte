<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let label: string;
  export let value: string;
  export let parameter: string = null;

  let _value = (parameter && $page.query.get(parameter)) || value;

  const id = `${parameter || label}-filter`;

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
  <label for={id} class="text-gray-600 text-xs whitespace-nowrap">
    {label}
  </label>
  <select
    class="block border-2 text-base p-2 w-full h-10"
    {id}
    bind:value={_value}
  >
    <slot />
  </select>
</div>
