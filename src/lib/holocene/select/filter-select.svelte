<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/stores';

  import type { SelectOptionValue } from '$lib/types/global';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Option from './simple-option.svelte';
  import Select from './simple-select.svelte';

  interface Props {
    label: string;
    value: SelectOptionValue;
    options?: SelectOptionValue[];
    parameter?: string;
    position?: string;
    children?: Snippet;
  }

  let {
    label,
    value,
    options = [],
    parameter = null,
    position,
    children,
    ...rest
  }: Props = $props();

  const id = `${parameter || label}-${
    position ? `${position}-filter` : 'filter'
  }`;
  const parameterValue = parameter && $page.url.searchParams.get(parameter);

  let _value = $state(parameterValue || (value && value.toString()));

  const onChange = () => {
    updateQueryParameters({
      parameter,
      value: _value,
      url: $page.url,
    }).then((v) => (value = v));
  };
</script>

<Select onchange={onChange} {id} bind:value={_value} {label} {...rest}>
  {#if children}
    {@render children()}
  {:else}
    {#each options.map((o) => o.toString()) as option}
      <Option value={option} />
    {/each}
  {/if}
</Select>
