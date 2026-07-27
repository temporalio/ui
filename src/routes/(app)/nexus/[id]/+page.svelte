<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import type { LayoutData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueueStatus from '$lib/components/task-queue-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEndpoint from '$lib/pages/nexus-endpoint.svelte';
  import {
    routeForNexus,
    routeForNexusEndpointEdit,
  } from '$lib/utilities/route-for';

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
      {#snippet actions(className: ClassNameValue = undefined)}
        <Button
          href={routeForNexusEndpointEdit(endpoint.id!)}
          class={merge(className)}
        >
          {translate('common.edit')}
        </Button>
      {/snippet}
      {#snippet taskQueueStatus()}
        <TaskQueueStatus {endpoint} />
      {/snippet}
    </NexusEndpoint>
  </div>
{/if}
