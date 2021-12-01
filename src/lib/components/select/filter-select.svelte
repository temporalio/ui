<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import Select from './select.svelte';

  export let label: string;
  export let options: string[] | Record<string, string>;
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
  <Select {id} bind:value={_value}>
    <slot />
  </Select>
</div>
