<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { namespace } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const currentDetails = $derived($workflowRun?.metadata?.currentDetails || '');

  let loading = $state(false);

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
    } catch (error) {
      console.error('Error fetching current details:', error);
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    fetchCurrentDetails();
  });
</script>

<div class="flex flex-1 flex-col gap-2">
  <div class="flex items-center justify-between">
    <h3>{translate('workflows.current-details')}</h3>
    {#if workflow.isRunning}
      <Tooltip text={translate('workflows.update-details')} left>
        <Button
          variant="ghost"
          on:click={fetchCurrentDetails}
          disabled={loading}
        >
          <Icon name="retry" />
        </Button>
      </Tooltip>
    {/if}
  </div>
  {#key currentDetails}
    <Markdown content={currentDetails} />
  {/key}
</div>
