<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoints from '$lib/pages/nexus-endpoints.svelte';
  import { routeForNexusEndpoint } from '$lib/utilities/route-for';

  import type { PageData } from '../$types';

  let { data }: { data: PageData } = $props();

  const { endpoints } = $derived(data);
</script>

<PageTitle title={translate('nexus.endpoints')} url={page.url.href} />
<NexusEndpoints {endpoints}>
  {#snippet headers()}
    <TableHeaderRow>
      <th>Name</th>
      <th>Last Updated</th>
      <th>Created On</th>
    </TableHeaderRow>
  {/snippet}
  {#snippet columns(endpoint)}
    <TableRow>
      <td>
        {#if endpoint.id && endpoint.spec?.name}
          <Link href={routeForNexusEndpoint(endpoint.id)} class="table-link">
            {endpoint.spec.name}
          </Link>
        {:else}
          <span class="text-secondary">—</span>
        {/if}
      </td>
      <td>
        {#if endpoint.lastModifiedTime}
          <Timestamp dateTime={endpoint.lastModifiedTime} relative />
        {:else}
          <span class="text-secondary">—</span>
        {/if}
      </td>
      <td>
        {#if endpoint.createdTime}
          <Timestamp dateTime={endpoint.createdTime} relative={false} />
        {:else}
          <span class="text-secondary">—</span>
        {/if}
      </td>
    </TableRow>
  {/snippet}
</NexusEndpoints>
