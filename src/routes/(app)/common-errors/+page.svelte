<script lang="ts">
  import { page } from '$app/state';

  import CommonErrorList from '$lib/components/common-errors/common-error-list.svelte';
  import {
    COMMON_ERRORS,
    getCommonErrorsBySeverity,
  } from '$lib/components/common-errors/common-errors-data';
  import PageTitle from '$lib/components/page-title.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import type { CommonErrorSeverity } from '$lib/types/common-errors';

  type FilterOption = CommonErrorSeverity | 'all';

  let activeFilter: FilterOption = $state('all');

  const errorCount = COMMON_ERRORS.filter((e) => e.severity === 'error').length;
  const warningCount = COMMON_ERRORS.filter(
    (e) => e.severity === 'warning',
  ).length;
  const infoCount = COMMON_ERRORS.filter((e) => e.severity === 'info').length;

  const filteredErrors = $derived(
    activeFilter === 'all'
      ? COMMON_ERRORS
      : getCommonErrorsBySeverity(activeFilter),
  );
</script>

<PageTitle title="Common Errors" url={page.url.href} />

<h1>Common Errors</h1>
<div class="border-b border-subtle">
  <TabButtons>
    <TabButton
      active={activeFilter === 'all'}
      on:click={() => {
        activeFilter = 'all';
      }}>All ({COMMON_ERRORS.length})</TabButton
    >
    <TabButton
      active={activeFilter === 'error'}
      icon="error"
      on:click={() => {
        activeFilter = 'error';
      }}>Errors ({errorCount})</TabButton
    >
    <TabButton
      active={activeFilter === 'warning'}
      icon="warning"
      on:click={() => {
        activeFilter = 'warning';
      }}>Warnings ({warningCount})</TabButton
    >
    <TabButton
      active={activeFilter === 'info'}
      icon="info"
      on:click={() => {
        activeFilter = 'info';
      }}>Info ({infoCount})</TabButton
    >
  </TabButtons>
</div>
<CommonErrorList errors={filteredErrors} />
