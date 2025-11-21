<script lang="ts">
  import { page } from '$app/state';

  import type { LayoutProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueueStatus from '$lib/components/task-queue-status.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';

  let { data, params }: LayoutProps = $props();

  const { endpoint } = $derived(data);
  const { id } = $derived(params);
</script>

<PageTitle
  title={translate('nexus.nexus-endpoint', { id })}
  url={page.url.href}
/>
<NexusEndpoint {endpoint}>
  {#snippet taskQueueStatus()}
    <TaskQueueStatus {endpoint} />
  {/snippet}
</NexusEndpoint>
