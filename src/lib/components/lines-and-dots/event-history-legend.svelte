<script lang="ts">
  import { eventCategoryColor } from '$lib/components/event/event-styles';
  import {
    CategoryIcon,
    getCategoryStrokeColor,
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

  let { eventTypesOnly = false } = $props();

  type Status =
    | WorkflowStatus
    | EventClassification
    | 'Delayed'
    | 'Completed with retries';

  const statuses: {
    status: Status;
    style?: string;
    label?: string;
  }[] = [
    { status: 'Completed' },
    {
      status: 'Completed with retries',
      style: `background: linear-gradient(255deg, ${getStatusStrokeColor('Completed')} 0%, #F55 100%)`,
    },
    { status: 'Failed' },
    { status: 'Fired' },
    { status: 'Signaled' },
    { status: 'TimedOut', label: 'Timed Out' },
    { status: 'Canceled' },
    { status: 'Running' },
    { status: 'Delayed' },
  ];

  const pendingStatuses = [
    { label: 'Pending', category: 'pending' },
    { label: 'Retry', category: 'retry' },
  ] as const;

  const categories = Object.keys(CategoryIcon) as EventTypeCategory[];
</script>

{#snippet term(label: string)}
  <dt class="mb-2 font-medium">{label}</dt>
{/snippet}

{#snippet statusKey({
  label,
  status,
  style,
}: {
  label?: string;
  status: Status;
  style?: string;
})}
  <dd class="mt-0.5 flex items-center gap-2">
    <span
      class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={status !== 'Completed with retries' && !style
        ? `background-color: ${getStatusStrokeColor(status)}`
        : style}
    ></span>
    {label ?? status}
  </dd>
{/snippet}

{#snippet pendingStatusKey(status: {
  label: string;
  category: 'pending' | 'retry';
})}
  <dd class="mt-0.5 flex items-center gap-2">
    <svg class="h-2.5 w-5 shrink-0" viewBox="0 0 15 10">
      <line
        class="animate-dash"
        x1="0"
        y1="5"
        x2="15"
        y2="5"
        stroke={getCategoryStrokeColor(status.category)}
        stroke-width="2"
        stroke-dasharray="3"
      />
    </svg>
    {status.label}
  </dd>
{/snippet}

{#snippet eventCategoryKey(category: EventTypeCategory)}
  {@const { name, title } = CategoryIcon[category]}
  <dd
    class="mt-1 flex items-center gap-2 {eventCategoryColor({
      category,
    })}"
  >
    <Icon {name} class="h-3.5 w-3.5 shrink-0" />
    {title}
  </dd>
{/snippet}

<Tooltip
  bottomLeft
  width={380}
  tooltipClass="!surface-primary border border-subtle"
>
  <div
    slot="content"
    class="flex gap-6 whitespace-normal p-2 text-xs max-sm:flex-col"
  >
    {#if !eventTypesOnly}
      <dl>
        {@render term(translate('common.status'))}
        {#each statuses as { status, label, style } (status)}
          {@render statusKey({ label, status, style })}
        {/each}
        {#each pendingStatuses as status (status.label)}
          {@render pendingStatusKey(status)}
        {/each}
      </dl>
    {/if}
    <dl>
      {@render term(translate('events.event-types'))}
      {#each categories as category (category)}
        {@render eventCategoryKey(category)}
      {/each}
    </dl>
  </div>
  <Icon name="info" class="text-secondary" />
</Tooltip>
