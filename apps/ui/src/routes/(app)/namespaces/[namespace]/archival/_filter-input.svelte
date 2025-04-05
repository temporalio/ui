<script lang="ts">
  import debounce from 'just-debounce';

  import { page } from '$app/stores';

  import Input from '$lib/holocene/input/input.svelte';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

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

<Input
  type="search"
  icon="search"
  label={name}
  labelHidden
  placeholder={name}
  {id}
  bind:value={_value}
/>
