<script lang="ts">
  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForEventHistory,
    routeForEventHistoryTable,
  } from '$lib/utilities/route-for';

  import { CategoryIcon } from './constants';

  const { namespace, workflow, run } = $derived(page.params);
  const routeParameters = $derived({
    namespace,
    workflow,
    run,
  });
</script>

<div class="flex items-center gap-2">
  <ToggleButtons>
    <ToggleButton
      data-testid="timeline-view"
      size="sm"
      href={routeForEventHistory({
        ...routeParameters,
      })}
      active={pathMatches(
        page.url.pathname,
        routeForEventHistory({
          ...routeParameters,
        }),
      )}
    >
      {translate('workflows.timeline-tab')}
    </ToggleButton>
    <ToggleButton
      data-testid="history-view"
      size="sm"
      href={routeForEventHistoryTable({
        ...routeParameters,
      })}
      active={pathMatches(
        page.url.pathname,
        routeForEventHistoryTable({
          ...routeParameters,
        }),
      )}
    >
      {translate('workflows.event-history')}
    </ToggleButton>
  </ToggleButtons>

  <Tooltip class="ml-1" right>
    <div slot="content" class="space-y-2 bg-primary p-2">
      <div class="text-xs font-semibold text-primary">Event Categories</div>
      <div class="space-y-1.5 text-xs">
        <div class="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Icon name={CategoryIcon.workflow} />
          <span>Workflow</span>
        </div>
        <div
          class="flex items-center gap-2 text-purple-600 dark:text-purple-500"
        >
          <Icon name={CategoryIcon.activity} />
          <span>Activity</span>
        </div>
        <div class="flex items-center gap-2 text-cyan-600">
          <Icon name={CategoryIcon['child-workflow']} />
          <span>Child Workflow</span>
        </div>
        <div
          class="flex items-center gap-2 text-yellow-600 dark:text-yellow-400"
        >
          <Icon name={CategoryIcon.timer} />
          <span>Timer</span>
        </div>
        <div class="flex items-center gap-2 text-pink-600 dark:text-pink-400">
          <Icon name={CategoryIcon.signal} />
          <span>Signal</span>
        </div>
        <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Icon name={CategoryIcon.update} />
          <span>Update</span>
        </div>
        <div
          class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
        >
          <Icon name={CategoryIcon.nexus} />
          <span>Nexus</span>
        </div>
        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Icon name={CategoryIcon['local-activity']} />
          <span>Local Activity</span>
        </div>
        <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Icon name={CategoryIcon.other} />
          <span>Other</span>
        </div>
      </div>
    </div>
    <Icon name="info" class="text-secondary hover:text-brand" />
  </Tooltip>
</div>
