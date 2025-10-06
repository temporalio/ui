<script lang="ts">
  import { page } from '$app/stores';

  import type { LayoutData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueueStatus from '$lib/components/task-queue-status.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { editDisabled } from '$lib/utilities/edit-disabled';

  let { data }: { data: LayoutData } = $props();

  const { endpoint } = $derived(data);
  const coreUser = coreUserStore();

  const isEditDisabled = $derived(
    editDisabled(
      $page.data.settings,
      $coreUser,
      endpoint?.spec?.target?.worker?.namespace,
    ),
  );
</script>

<PageTitle
  title={translate('nexus.nexus-endpoint', { id: $page.params.id })}
  url={$page.url.href}
/>
<NexusEndpoint {endpoint} editDisabled={isEditDisabled}>
  {#snippet taskQueueStatus()}
    <TaskQueueStatus {endpoint} />
  {/snippet}
</NexusEndpoint>
