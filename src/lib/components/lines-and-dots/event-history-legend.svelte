<script lang="ts">
  import { eventCategoryColor } from '$lib/components/event/event-styles';
  import {
    CategoryIcon,
    getStatusStrokeColor,
  } from '$lib/components/lines-and-dots/constants';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';
  import type { WorkflowStatus } from '$lib/types/workflows';

  const statuses: {
    status: WorkflowStatus | EventClassification | 'Delayed';
    label?: string;
  }[] = [
    { status: 'Completed' },
    { status: 'Failed' },
    { status: 'Fired' },
    { status: 'Signaled' },
    { status: 'TimedOut', label: 'Timed Out' },
    { status: 'Canceled' },
    { status: 'Running' },
    { status: 'Delayed' },
  ];

  const eventTypes: { category: EventTypeCategory; label: string }[] = [
    { category: 'activity', label: 'Activity' },
    { category: 'child-workflow', label: 'Child Workflow' },
    { category: 'signal', label: 'Signal' },
    { category: 'timer', label: 'Timer' },
    { category: 'update', label: 'Update' },
    { category: 'nexus', label: 'Nexus' },
    { category: 'workflow', label: 'Workflow' },
    { category: 'other', label: 'Other' },
  ];
</script>

<Tooltip
  bottomLeft
  width={380}
  tooltipClass="!surface-primary border border-subtle"
>
  <div slot="content" class="flex gap-6 p-2 text-xs">
    <dl>
      <dt class="font-medium">{translate('common.status')}</dt>
      {#each statuses as { status, label } (status)}
        <dd class="mt-0.5 flex items-center gap-2">
          <span
            class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style="background-color: {getStatusStrokeColor(status)}"
          ></span>
          {label ?? status}
        </dd>
      {/each}
    </dl>
    <dl>
      <dt class="font-medium">{translate('events.event-types')}</dt>
      {#each eventTypes as { category, label } (category)}
        <dd
          class="mt-1 flex items-center gap-2 {eventCategoryColor({
            category,
          })}"
        >
          <Icon name={CategoryIcon[category]} class="h-3.5 w-3.5 shrink-0" />
          {label}
        </dd>
      {/each}
    </dl>
  </div>
  <Icon name="info" class="text-secondary" />
</Tooltip>
