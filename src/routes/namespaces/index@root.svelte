<script lang="ts">
  import { routeForNamespace } from '$lib/utilities/route-for';
  import { page } from '$app/stores';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import Table from '$holocene/table/table.svelte';
  import TableHeaderRow from '$holocene/table/table-header-row.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import { fetchNamespaces } from '$lib/services/namespaces-service';
  import type { ListNamespacesResponse } from '$types';

  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const namespacesPromise: Promise<ListNamespacesResponse> = fetchNamespaces(
    $page.stuff.settings,
  );
</script>

<PageTitle title="Namespaces" url={$page.url.href} />
<h1 data-cy="namespace-selector-title" class="mb-8 text-2xl">Namespaces</h1>
{#await namespacesPromise}
  <Loading />
{:then namespacesResponse}
  {@const { namespaces } = namespacesResponse}
  {@const filteredNamespaces = namespaces.filter(
    (namespace) =>
      showTemporalSystemNamespace ||
      namespace.namespaceInfo.name !== 'temporal-system',
  )}
  {#if filteredNamespaces.length > 0}
    <Pagination items={filteredNamespaces} let:visibleItems>
      <Table variant="fancy" class="w-full">
        <TableHeaderRow slot="headers">
          <th>Name</th>
        </TableHeaderRow>
        {#each visibleItems as namespace}
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
    </Pagination>
  {:else}
    <EmptyState
      title={'No Namespaces Found'}
      content={'You do not have access to a Namespace. Contact your Administrator for assistance.'}
    />
  {/if}
{/await}
