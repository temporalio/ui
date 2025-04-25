<script lang="ts">
  import { fade } from 'svelte/transition';

  import { page } from '$app/state';

  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const query = $derived(page.url.searchParams.get('query'));
  let savedQueryName = $state('');

  function setManualString(query: string) {
    if (!query) {
      savedQueryName = '';
    }
  }

  $effect(() => {
    setManualString(query);
  });

  const onSearch = (query: string) => {
    try {
      $workflowFilters = toListWorkflowFilters(query, $searchAttributes);
    } catch (e) {
      console.error(e);
    }

    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };

  function onSavedQueryChange(e) {
    onSearch(e.detail.value.query);
  }
</script>

<div class="shrink-1 w-full" in:fade>
  <Combobox
    label="saved-queries"
    noResultsText="No resuts"
    placeholder="Bookmarked Queries"
    labelHidden
    bind:value={savedQueryName}
    id="saved-query-combobox"
    leadingIcon="bookmark"
    options={[
      {
        label: 'Started Today',
        value: 'today-running',
        query: '`StartTime`>="2025-04-09T05:00:00.000Z"',
      },
      {
        label: 'Failed Today',
        value: 'today-failed',
        query:
          '(`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut") AND `StartTime`>="2025-04-09T05:00:00.000Z"',
      },
      {
        label: '🧠 Sanity check',
        value: 'sanity',
        query: '`WorkflowType`="workflow.sanity"',
      },
      {
        label: '> 5 seconds',
        value: 'greater-than-5-seconds',
        query: '`ExecutionStatus`="Completed" AND `ExecutionDuration`>"5s"',
      },
      {
        label: '> 15 seconds',
        value: 'greater-than-15-seconds',
        query: '`ExecutionStatus`="Completed" AND `ExecutionDuration`>"15s"',
      },
      {
        label: '> 1 Minute 🔥🚒',
        value: 'greater-than-1-minute',
        query: '`ExecutionStatus`="Completed" AND `ExecutionDuration`>"15m"',
      },
      {
        label:
          'Custom canary test on canary task queue without any pinned deployments',
        value: 'shipment-rollout',
        query:
          '`TaskQueue`="canary-task-queue" AND `CustomKeywordField`="canaryTest" AND `TemporalWorkerDeployment` is null',
      },
    ]}
    optionValueKey="value"
    optionLabelKey="label"
    on:change={onSavedQueryChange}
    minSize={32}
  />
</div>
