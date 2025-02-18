<script lang="ts">
  import { page } from '$app/stores';

  import AccordionLight from '$lib/holocene/accordion/accordion-light.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: currentDetails = $workflowRun?.metadata?.currentDetails || '';
  $: openWithoutDetails = workflow.isRunning && !currentDetails;
  $: closedWithoutDetails = !workflow.isRunning && !currentDetails;

  let loading = false;

  const fetchCurrentDetails = async () => {
    if (loading) return;
    loading = true;
    try {
      const { settings } = $page.data;
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
      if (!metadata.currentDetails) {
        $workflowRun.metadata.currentDetails = translate(
          'workflows.no-current-details',
        );
      }
    } catch (error) {
      console.error('Error fetching current details:', error);
    } finally {
      loading = false;
    }
  };
</script>

{#if !openWithoutDetails}
  <AccordionLight
    let:open
    onToggle={closedWithoutDetails ? fetchCurrentDetails : undefined}
    icon={closedWithoutDetails ? 'retry' : undefined}
  >
    <div slot="title" class="flex w-full items-center gap-2 p-2 text-xl">
      <Icon name="flag" class="text-brand" width={32} height={32} />
      {translate('workflows.current-details')}
      {#if loading}{translate('common.loading')}{/if}
    </div>
    {#if open}
      {#key currentDetails}
        <Markdown content={currentDetails} />
      {/key}
    {/if}
    <svelte:fragment slot="action">
      {#if workflow.isRunning}
        <Tooltip text="Update Details" left>
          <Button
            variant="ghost"
            on:click={fetchCurrentDetails}
            disabled={loading}
          >
            <Icon name="retry" />
          </Button>
        </Tooltip>
      {/if}
    </svelte:fragment>
  </AccordionLight>
{/if}
