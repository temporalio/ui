<script lang="ts">
  import PageTitle from '$lib/components/page-title.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoints from '$lib/pages/nexus-endpoints.svelte';
  import { page } from '$lib/svelte-mocks/app/stores';
  import { routeForNexusEndpoint } from '$lib/utilities/route-for';

  import type { PageData } from '../$types';

  export let data: PageData;

  $: ({ endpoints } = data);
</script>

<PageTitle title={translate('nexus.endpoints')} url={$page.url.href} />
<NexusEndpoints {endpoints}>
  {#snippet headers()}
    <th>Name</th>
    <th>Last Updated</th>
    <th>Created On</th>
  {/snippet}
  {#snippet columns(endpoint)}
    <td class="px-2">
      {#if endpoint.id && endpoint.spec?.name}
        <Link href={routeForNexusEndpoint(endpoint.id)} class="table-link">
          {endpoint.spec.name}
        </Link>
      {:else}
        <span class="text-secondary">—</span>
      {/if}
    </td>
    <td class="px-2">
      {#if endpoint.lastModifiedTime}
        <Timestamp dateTime={endpoint.lastModifiedTime} relative />
      {:else}
        <span class="text-secondary">—</span>
      {/if}
    </td>
    <td class="px-2">
      {#if endpoint.createdTime}
        <Timestamp dateTime={endpoint.createdTime} relative={false} />
      {:else}
        <span class="text-secondary">—</span>
      {/if}
    </td>
  {/snippet}
</NexusEndpoints>
