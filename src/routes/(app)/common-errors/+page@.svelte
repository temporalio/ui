<script lang="ts">
  import { page } from '$app/state';

  import CommonErrorList from '$lib/components/common-errors/common-error-list.svelte';
  import {
    COMMON_ERRORS,
    getCommonErrorsBySeverity,
  } from '$lib/components/common-errors/common-errors-data';
  import PageTitle from '$lib/components/page-title.svelte';
  import VerticalNavItem from '$lib/holocene/vertical-nav/vertical-nav-item.svelte';
  import VerticalNav from '$lib/holocene/vertical-nav/vertical-nav.svelte';
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

<div class="flex h-full">
  <div class="w-56 shrink-0 border-r border-subtle p-4">
    <VerticalNav aria-label="Filter by severity" activeItemId={activeFilter}>
      <VerticalNavItem
        id="all"
        label="All"
        href="#"
        description="{COMMON_ERRORS.length} errors"
        active={activeFilter === 'all'}
        onclick={() => {
          activeFilter = 'all';
        }}
      />
      <VerticalNavItem
        id="error"
        label="Errors"
        href="#"
        leadingIcon="error"
        description="{errorCount} errors"
        active={activeFilter === 'error'}
        onclick={() => {
          activeFilter = 'error';
        }}
      />
      <VerticalNavItem
        id="warning"
        label="Warnings"
        href="#"
        leadingIcon="warning"
        description="{warningCount} warnings"
        active={activeFilter === 'warning'}
        onclick={() => {
          activeFilter = 'warning';
        }}
      />
      <VerticalNavItem
        id="info"
        label="Info"
        href="#"
        leadingIcon="info"
        description="{infoCount} tips"
        active={activeFilter === 'info'}
        onclick={(e) => {
          activeFilter = 'info';
        }}
      />
    </VerticalNav>
  </div>

  <div class="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
    <CommonErrorList errors={filteredErrors} />
  </div>
</div>
