<script lang="ts">
  import { page } from '$app/stores';

  import type { SelectOptionValue } from '$lib/types/global';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Option from './simple-option.svelte';
  import Select from './simple-select.svelte';

  export let label: string;
  export let value: SelectOptionValue;
  export let options: SelectOptionValue[] = [];
  export let parameter: string = null;
  export let position: string | undefined = undefined;

  const id = `${parameter || label}-${
    position ? `${position}-filter` : 'filter'
  }`;
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

<Select onchange={onChange} {id} bind:value={_value} {label} {...$$props}>
  <slot>
    {#each options.map((o) => o.toString()) as option}
      <Option value={option} />
    {/each}
  </slot>
</Select>
