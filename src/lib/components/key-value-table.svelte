<script lang="ts">
  import CodeBlock from './code-block.svelte';

  export let headings: [string, string] = null;
  export let data: any;
  export let child: boolean = false;
  export let full: boolean = false;

  let isNumber = typeof data === 'number';
  let isString = typeof data === 'string';
  let isUndefined = typeof data === 'undefined';
  let isBoolean = typeof data === 'boolean';
  let isNaN = Number.isNaN(data);
  let isArray = Array.isArray(data);
  let isNull = data === null;
  let isObject = typeof data === 'object' && !isArray && !isNull && !isNaN;
</script>

{#if isObject && Object.keys(data).length}
  <table class:child class:full>
    {#if headings}
      <thead>
        <tr>
          {#each headings as heading}
            <th>{heading}</th>
          {/each}
        </tr>
      </thead>
    {/if}
    <tbody>
      {#each Object.entries(data) as [key, value]}
        <tr>
          <th class="w-1/3">{key}</th>

          <td class="w-2/3"><svelte:self data={value} child={true} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else if isArray}
  {#if data.length}
    {#each data as datum}
      <svelte:self data={datum} child={true} />
    {/each}
  {:else}
    <div class="text-gray-500">(Empty)</div>
  {/if}
{:else if isString || isNumber}
  <div>{String(data)}</div>
{:else if isNull || isBoolean || isNaN}
  <div><CodeBlock content={data} /></div>
{:else if isUndefined}
  <div class="text-gray-500">(Undefined)</div>
{:else}
  <div class="text-gray-500">(Empty)</div>
{/if}

<style lang="postcss">
  table {
    @apply border-2 border-gray-500 border-collapse w-full table-fixed;
  }

  table.child {
    @apply border-2 border-l-4 border-gray-500 table-fixed;
  }

  table.full {
    @apply border-l-0 border-r-0;
  }

  th {
    @apply bg-gray-300 text-left overflow-x-hidden overflow-ellipsis;
  }

  .child tr {
    @apply overflow-x-scroll;
  }

  tbody th {
    @apply bg-gray-200 w-48;
  }

  tr {
    @apply bg-gray-50;
  }

  tr:nth-child(odd) {
    @apply bg-gray-100;
  }

  th,
  td {
    @apply p-2 overflow-x-scroll;
  }
</style>
