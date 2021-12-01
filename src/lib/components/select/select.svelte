<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import Option from '$lib/components/select/option.svelte';

  export let id: string = null;
  export let value: string | boolean;
  export let options: string[] | Record<string, string> = null;
  export let parameter: string = null;
  export let type: string = 'default';
  export let condensed = false;

  let _value = (parameter && $page.query.get(parameter)) || value;

  id = parameter ? `${parameter}-filter` : id;

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
  <select
    class="inline border-2 text-base p-2 w-full h-10 rounded-lg"
    {id}
    bind:value
    on:change
  >
    {#if options}
      {#if Array.isArray(options)}
        {#each options as value}
          <Option {value}>{value}</Option>
        {/each}
      {:else}
        {#each Object.entries(options) as [label, value]}
          <Option {value}>{label}</Option>
        {/each}
      {/if}
    {:else}
      <slot />
    {/if}
  </select>
</div>
