<script>import { page } from '$app/stores';
import { updateQueryParameters } from '../../utilities/update-query-parameters';
import Select from './simple-select.svelte';
import Option from './simple-option.svelte';
export let label = null;
export let value;
export let options = [];
export let parameter = null;
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

<Select on:change={onChange} {id} bind:value={_value} {...$$props}>
  <slot>
    {#each options as option}
      <Option value={option} />
    {/each}
  </slot>
</Select>
