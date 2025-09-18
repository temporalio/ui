<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/markdown-editor/markdown-preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);

  const currentDetails = $derived($workflowRun?.metadata?.currentDetails || '');

  let loading = $state(false);
  let lastFetched = $state<Date | null>(null);

  const fetchCurrentDetails = async () => {
    if (loading) return;
    loading = true;
    try {
      const { settings } = page.data;
      const metadata = await getWorkflowMetadata(
        {
          namespace,
          workflow: {
            id: workflow.id,
            runId: workflow.runId,
          },
        },
        settings,
        $authUser?.accessToken,
      );
      $workflowRun.metadata = metadata;
      lastFetched = new Date();
    } catch (error) {
      console.error('Error fetching current details:', error);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    fetchCurrentDetails();
  });
  const handleKeydown = (event) => {
    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      fetchCurrentDetails();
    }
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex h-full flex-1 flex-col border-l border-subtle">
  <div class="surface-information w-full px-6 py-2">
    <div class="flex items-center justify-between">
      <h3>{translate('workflows.current-details')}</h3>
      <div class="flex flex-row items-center gap-2 lg:flex-col xl:flex-row">
        <p class="hidden sm:block">
          Press the <span
            class="mx-1 rounded bg-subtle px-1 text-sm font-medium leading-4"
            >R</span
          > for freshness
        </p>
        <div class="flex items-center sm:hidden">
          <p>Press for freshness</p>
          <Button
            variant="ghost"
            on:click={fetchCurrentDetails}
            disabled={loading}
          >
            <Icon name="retry" />
          </Button>
        </div>
        {#if lastFetched}
          <p class="text-xs text-secondary">
            {formatDate(lastFetched, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>
        {/if}
      </div>
    </div>
  </div>
  <div class="surface-background h-full">
    {#key currentDetails}
      <Markdown
        class="p-3"
        overrideTheme="background"
        content={currentDetails}
      />
    {/key}
  </div>
</div>
