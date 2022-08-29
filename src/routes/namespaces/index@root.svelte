<script lang="ts">
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { routeForNamespace } from '$lib/utilities/route-for';
  import { page } from '$app/stores';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import Table from '$holocene/table/table.svelte';
  import TableHeaderRow from '$holocene/table/table-header-row.svelte';
  import TableRow from '$holocene/table/table-row.svelte';

  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const namespaces = ($page.stuff.namespaces || []).filter(
    (namespace: Namespace) =>
      showTemporalSystemNamespace ||
      namespace.namespaceInfo.name !== 'temporal-system',
  );
</script>

<PageTitle title="Namespaces" url={$page.url.href} />
<h1 data-cy="namespace-selector-title" class="mb-8 text-2xl">Namespaces</h1>
{#if namespaces?.length > 0}
  <Table variant="fancy" class="w-full">
    <TableHeaderRow slot="headers">
      <th>Name</th>
    </TableHeaderRow>
    {#each namespaces as namespace}
      <TableRow>
        <td>
          <a
            href={routeForNamespace({
              namespace: namespace.namespaceInfo.name,
            })}
            class="hover:text-blue-700 hover:underline hover:decoration-blue-700"
            >{namespace.namespaceInfo.name}</a
          >
        </td>
      </TableRow>
    {/each}
  </Table>
{:else}
  <div class="prose mt-[15vh] max-w-none text-center">
    <h3>No Namespaces Found</h3>
    <p>
      You do not have access to a Namespace.
      <br />
      Contact your Administrator for assistance.
    </p>
  </div>
{/if}
