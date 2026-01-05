<script lang="ts">
  import { page } from '$app/stores';

  import type { LayoutData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueueStatus from '$lib/components/task-queue-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';
  import { routeForNexus } from '$lib/utilities/route-for';

  let { data }: { data: LayoutData } = $props();

  const { endpoint } = $derived(data);
</script>

<PageTitle
  title={translate('nexus.nexus-endpoint', { id: $page.params.id })}
  url={$page.url.href}
/>
{#if endpoint}
  <div class="flex flex-col gap-4">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
    <NexusEndpoint {endpoint}>
      {#snippet taskQueueStatus()}
        <TaskQueueStatus {endpoint} />
      {/snippet}
    </NexusEndpoint>
  </div>
{/if}
