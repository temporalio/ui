<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import type { Endpoint } from '$lib/types';
  import { pluralize } from '$lib/utilities/pluralize';

  let { endpoint }: { endpoint: Endpoint } = $props();
  let pollerCount: number | undefined = $state(undefined);

  const checkTaskQueue = async (endpoint: Endpoint) => {
    const targetNamespace = endpoint?.spec?.target?.worker?.namespace;
    const targetTaskQueue = endpoint?.spec?.target?.worker?.taskQueue;
    if (targetNamespace && targetTaskQueue) {
      try {
        const { pollers } = await getPollers({
          namespace: targetNamespace,
          queue: targetTaskQueue,
        });
        pollerCount = pollers.length;
      } catch (error) {
        pollerCount = undefined;
      }
    }
  };

  $effect(() => {
    checkTaskQueue(endpoint);
  });
</script>

{#if pollerCount !== undefined}
  <Alert
    intent={pollerCount > 0 ? 'success' : 'warning'}
    title={pollerCount ? 'Task Queue is Active' : 'Task Queue is Inactive'}
  >
    <div class="flex w-full items-center justify-between">
      <p>
        {pollerCount}
        {pluralize('Worker', pollerCount)}
      </p>
    </div></Alert
  >
{/if}
