<script lang="ts">
  export let headings: [string, string] = null;
  export let data: any;
  export let child: boolean = false;

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
  <table class:child>
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
          <th>{key}</th>
          <td><svelte:self data={value} child={true} /></td>
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
  <div><code>{String(data)}</code></div>
{:else if isUndefined}
  <div class="text-gray-500">(Undefined)</div>
{:else}
  <div class="text-gray-500">(Empty)</div>
{/if}

<style lang="postcss">
  table {
    @apply border-t-2 border-b-2 border-gray-500 w-full border-collapse;
  }

  table.child {
    @apply border-2 border-l-4 border-gray-500;
  }

  th {
    @apply bg-gray-300 text-left;
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
    @apply p-6;
  }
</style>
