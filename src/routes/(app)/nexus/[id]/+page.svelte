<script lang="ts">
  import { page } from '$app/stores';

  import type { LayoutData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueueStatus from '$lib/components/task-queue-status.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';

  let { data }: { data: LayoutData } = $props();

  const { endpoint } = $derived(data);
</script>

<PageTitle
  title={translate('nexus.nexus-endpoint', { id: $page.params.id })}
  url={$page.url.href}
/>
<NexusEndpoint {endpoint}>
  {#snippet taskQueueStatus()}
    <TaskQueueStatus {endpoint} />
  {/snippet}
</NexusEndpoint>
