<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
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
    <p class="hidden sm:block">
      Press the <span
        class="mx-1 rounded bg-subtle px-1 text-sm font-medium leading-4"
        >R</span
      > for freshness.
    </p>
    <div class="flex items-center sm:hidden">
      <p>Press for freshness</p>
      <Button variant="ghost" on:click={fetchCurrentDetails} disabled={loading}>
        <Icon name="retry" />
      </Button>
    </div>
  </div>
  <div
    class="surface-background flex h-full flex-col justify-between gap-2 p-6"
  >
    <div class="flex flex-col gap-2">
      <h3 class="pl-6 pt-6">{translate('workflows.current-details')}</h3>
    </div>
    {#key currentDetails}
      <Markdown
        className="p-3"
        overrideTheme="background"
        content={currentDetails}
      />
    {/key}
  </div>
</div>
