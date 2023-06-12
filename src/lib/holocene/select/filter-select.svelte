<script lang="ts">
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Select from './simple-select.svelte';
  import Option from './simple-option.svelte';

  import type { SelectOptionValue } from '$lib/types/global';

  export let label: string = null;
  export let value: SelectOptionValue;
  export let options: SelectOptionValue[] = [];
  export let parameter: string = null;

  const id = `${parameter || label}-filter`;
  const parameterValue = parameter && $page.url.searchParams.get(parameter);

  let _value = parameterValue || (value && value.toString());

  const onChange = () => {
    updateQueryParameters({
      parameter,
      value: _value,
      url: $page.url,
    }).then((v) => (value = v));
  };
</script>

<Select
  on:change={onChange}
  {id}
  bind:value={_value}
  {...$$props}
  class="border-[1px] border-gray-900 outline-none focus-visible:outline focus-visible:outline-blue-700"
>
  <slot>
    {#each options.map((o) => o.toString()) as option}
      <Option value={option} />
    {/each}
  </slot>
</Select>
