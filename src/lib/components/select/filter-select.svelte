<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Select from './select.svelte';
  import Option from './option.svelte';

  export let label: string = null;
  export let value: SelectOptionValue;
  export let options: SelectOptionValue[] = [];
  export let parameter: string = null;

  const id = `${parameter || label}-filter`;
  const parameterValue = parameter && $page.url.searchParams.get(parameter);

  let _value = parameterValue || (value && value.toString());

  $: {
    updateQueryParameters({
      parameter,
      value: _value,
      query: $page.url.searchParams,
      path: $page.url.pathname,
      goto,
    }).then((v) => (value = v));
  }
</script>

<Select {id} bind:value={_value} {...$$props}>
  <slot>
    {#each options as option}
      <Option value={option} />
    {/each}
  </slot>
</Select>
