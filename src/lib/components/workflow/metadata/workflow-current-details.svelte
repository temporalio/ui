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
  //   const currentDetails = `# Cryptids & Mythical Creatures

  // Cryptids are animals or beings whose existence is suggested but not confirmed by scientific evidence. From misty mountains to deep oceans, tales of mysterious creatures have captured imaginations across cultures.

  // ## Legendary Beasts of the World

  // ### Popular Cryptids

  // - Bigfoot
  // - Mothman
  // - Jersey Devil
  // - Chupacabra
  // - Thunderbird

  // ## Documented Encounters

  // 1. 1967: Patterson-Gimlin Film captures footage of a supposed Bigfoot in California.
  // 2. 1977: Silver Bridge collapses, linked to Mothman sightings.
  // 3. 1995: Chupacabra reports begin in Puerto Rico.
  // 4. 2004: Thunderbird allegedly seen in Alaska.
  // 5. 2011: Lake Erie Monster captured on blurry cam footage.

  // ### Chupacabra Behavior

  // According to local farmers:

  // - Attacks occur **at night**
  // - Targets **livestock**, especially goats
  // - Leaves **puncture wounds**
  // - Some describe it as **reptilian**, others **alien-like**

  // ## Code Block: Sample Cryptid Entry

  // \`\`\`ts
  // const cryptid = {
  //   name: 'Bigfoot',
  //   region: 'North America',
  //   sightings: 2378,
  //   dangerLevel: 'Moderate',
  // };
  // \`\`\`

  // [Learn more about cryptids](https://en.wikipedia.org/wiki/Cryptid)
  // `;
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

<div class="flex h-full flex-1 flex-col border-l border-subtle">
  <div class="surface-information w-full px-6 py-2">
    Press the <span
      class="mx-1 rounded bg-subtle px-1 text-sm font-medium leading-4">R</span
    > for freshness.
  </div>
  <div class="surface-background flex flex-col justify-between gap-2 p-6">
    <div class="flex flex-col gap-2">
      <h3 class="pl-6 pt-6">{translate('workflows.current-details')}</h3>
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
      <Markdown
        className="p-2"
        overrideTheme="background"
        content={currentDetails}
      />
    {/key}
  </div>
</div>
