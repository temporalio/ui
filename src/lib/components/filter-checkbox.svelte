<script lang="ts">
  import debounce from 'just-debounce';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let parameter: string;
  export let name: string;
  export let value: boolean;

  let _value: boolean =
    !!(parameter && $page.url.searchParams.get(parameter)) || value;

  const id = `${parameter || name}-filter`;
  const update = debounce(updateQueryParameters, 300);

  $: {
    update({
      parameter,
      value: _value,
      query: $page.url.searchParams,
      path: $page.url.pathname,
      goto,
    });
  }
</script>

<div>
  <input type="checkbox" {id} bind:checked={_value} />
  <label for={id}>{name}</label>
</div>
