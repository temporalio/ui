<script lang="ts">
  import { page } from '$app/stores';

  import type { SelectOptionValue } from '$lib/types/global';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Option from './simple-option.svelte';
  import Select, { type Props as SelectProps } from './simple-select.svelte';

  interface Props extends Omit<SelectProps, 'id'> {
    label: string;
    value: SelectOptionValue;
    options?: SelectOptionValue[];
    parameter?: string;
    position?: string;
  }

  let {
    label,
    value,
    options = [],
    parameter = null,
    position = undefined,
    children,
    ...rest
  }: Props = $props();

  const id = $derived(
    `${parameter || label}-${position ? `${position}-filter` : 'filter'}`,
  );

  const parameterValue = $derived(
    parameter && $page.url.searchParams.get(parameter),
  );

  let _value = $derived(parameterValue || (value && value.toString()));

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
