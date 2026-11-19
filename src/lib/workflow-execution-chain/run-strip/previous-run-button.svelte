<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';

  import type { WorkflowExecutionChain } from '../workflow-execution-chain.svelte';

  import EndCap from './end-cap.svelte';

  interface Props {
    chain: WorkflowExecutionChain;
    selectedRunId: string | null;
    contentScrolledUnder: boolean;
    loadOlderRuns: () => Promise<void>;
    onSelect: (runId: string) => void;
  }

  let {
    chain,
    selectedRunId,
    contentScrolledUnder,
    loadOlderRuns,
    onSelect,
  }: Props = $props();

  const previousLoadedRunId = $derived.by(() => {
    const position = chain.runs.findIndex((run) => run.runId === selectedRunId);
    return position > 0 ? chain.runs[position - 1].runId : undefined;
  });
  const selectedIsOldestLoaded = $derived(
    selectedRunId !== null && chain.runs[0]?.runId === selectedRunId,
  );

  const button = $derived.by(() => {
    if (previousLoadedRunId) {
      return {
        disabled: false,
        tooltip: translate('workflows.view-previous-run'),
      };
    }
    if (!selectedIsOldestLoaded) {
      return {
        disabled: true,
        tooltip: translate('workflows.view-previous-run'),
      };
    }
    if (chain.boundary === 'chainStart') {
      return { disabled: true, tooltip: translate('workflows.start-of-chain') };
    }
    if (chain.boundary === 'retention') {
      return { disabled: true, tooltip: translate('workflows.past-retention') };
    }
    return {
      disabled: chain.walking,
      tooltip: translate('workflows.view-previous-run'),
    };
  });

  const selectPreviousRun = async () => {
    if (button.disabled) {
      return;
    }
    if (previousLoadedRunId) {
      onSelect(previousLoadedRunId);
      return;
    }
    const runIdWhenClicked = selectedRunId;
    await loadOlderRuns();
    if (runIdWhenClicked === selectedRunId && previousLoadedRunId) {
      onSelect(previousLoadedRunId);
    }
  };
</script>

<EndCap
  side="start"
  {contentScrolledUnder}
  tooltip={button.tooltip}
  label={translate('workflows.view-previous-run')}
  disabled={button.disabled}
  busy={chain.walking && selectedIsOldestLoaded}
  onclick={selectPreviousRun}
>
  <IconChevronLeft />
</EndCap>
