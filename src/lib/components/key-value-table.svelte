<script lang="ts">
  export let headings: [string, string];
  export let data: { [key: string]: any };
</script>

<table>
  <thead>
    <tr>
      {#each headings as heading}
        <th>{heading}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each Object.entries(data) as [key, value]}
      <tr>
        <td>{key}</td>
        <td>{value}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="postcss">
  table {
    @apply border-collapse w-full border-2 mb-8;
  }

  th {
    @apply bg-gray-200 text-gray-500 text-xs h-6 m-0 p-3 text-left uppercase;
  }

  tr {
    @apply py-4 my-4;
    @apply bg-gray-50;
  }

  td {
    @apply p-4;
  }
</style>
