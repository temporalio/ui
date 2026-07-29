<script module lang="ts">
  import { cva } from 'class-variance-authority';

  import type { IconName } from '$lib/holocene/icon/paths';

  export type FilterToggle = {
    id: string;
    label: string;
    icon?: IconName;
    checked: boolean;
    disabled?: boolean;
    liveIndicator?: boolean;
    onChange: () => void;
  };

  export type FilterAction = {
    id: string;
    label: string;
    icon?: IconName;
    disabled?: boolean;
    onClick: () => void;
  };

  export type FilterView = {
    id: string;
    label: string;
    icon?: IconName;
    active: boolean;
    onSelect: () => void;
  };

  export type FilterFacet = 'event-type' | 'status' | 'refine';

  const ALL_FACETS: FilterFacet[] = ['event-type', 'status', 'refine'];
  const chipClass = cva(
    [
      'flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs',
      'transition-opacity duration-150',
      'disabled:cursor-not-allowed disabled:opacity-30',
    ],
    {
      variants: {
        pressed: {
          true: 'border-interactive surface-interactive-secondary',
          false: 'border-subtle opacity-60 hover:opacity-100',
        },
      },
    },
  );
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { eventCategoryColor } from '$lib/components/event/event-styles';
  import {
    dotColors,
    getStatusStrokeColor,
  } from '$lib/components/lines-and-dots/colors';
  import { CategoryIcon } from '$lib/components/lines-and-dots/constants';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { clearActiveGroups } from '$lib/stores/active-events';
  import {
    eventAttributeFilter,
    eventClassificationFilter,
    eventTypeFilter,
  } from '$lib/stores/filters';
  import { temporalVersion } from '$lib/stores/versions';
  import type {
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';
  import {
    countBy,
    type EventGroupAttribute,
    eventGroupAttributes,
    filterableEventClassifications,
    getGroupClassification,
    isGroupRetried,
  } from '$lib/utilities/event-group-filters';
  import { getEventClassificationLabel } from '$lib/utilities/get-status-label';
  import { nexusEnabled } from '$lib/utilities/nexus-enabled';
  import { isVersionNewer } from '$lib/utilities/version-check';

  interface Props {
    groups: EventGroup[];
    facets?: FilterFacet[];
    toggles?: FilterToggle[];
    actions?: FilterAction[];
    views?: FilterView[];
    refineOptions?: EventGroupAttribute[];
    counts?: {
      category?: Record<string, number>;
      classification?: Record<string, number>;
      attribute?: Record<string, number>;
    };
    compact?: boolean;
  }

  let {
    groups,
    facets = ALL_FACETS,
    toggles = [],
    actions = [],
    views = [],
    refineOptions = [...eventGroupAttributes],
    counts,
    compact = false,
  }: Props = $props();

  const categoryOptions = $derived.by(() => {
    let list = (compact ? compactEventTypeOptions : allEventTypeOptions).map(
      (option) => ({
        value: option.value,
        label: translate(option.label),
        icon: CategoryIcon[option.value].name,
      }),
    );
    if (isVersionNewer('1.21.0', $temporalVersion)) {
      list = list.filter(({ value }) => value !== 'update');
    }
    if (!nexusEnabled(page.data.systemInfo?.capabilities)) {
      list = list.filter(({ value }) => value !== 'nexus');
    }
    return list;
  });

  const allCategories = $derived(categoryOptions.map(({ value }) => value));

  const categoryCounts = $derived(
    counts?.category ?? countBy(groups, (group) => group.category),
  );
  const classificationCounts = $derived(
    counts?.classification ?? countBy(groups, getGroupClassification),
  );

  const hasCounted = $derived(
    Object.values(categoryCounts).some(Boolean) ||
      Object.values(classificationCounts).some(Boolean),
  );

  // Sorted by translated label, not by enum value — 'TimedOut' displays as
  // "Timed Out". Order is fixed regardless of counts, matching the event-type
  // strip: statuses this workflow hasn't produced stay in place disabled rather
  // than being omitted, so chips don't reshuffle as history streams in.
  const classificationOptions = $derived(
    filterableEventClassifications
      .map((classification) => ({
        value: classification,
        label: getEventClassificationLabel(classification),
        colors: dotColors(classification),
        total: classificationCounts[classification] ?? 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  );

  const attributeLabels: Record<EventGroupAttribute, string> = {
    pending: translate('events.legend-filter.pending'),
    retried: translate('events.legend-filter.retried'),
    'completed-with-retries': translate(
      'events.legend-filter.completed-with-retries',
    ),
  };

  const attributeOptions = $derived(
    eventGroupAttributes
      .filter((value) => refineOptions.includes(value))
      .map((value) => ({ value, label: attributeLabels[value] })),
  );

  const attributeCounts = $derived.by(() => {
    if (counts?.attribute) return counts.attribute;
    const tally: Record<string, number> = {
      pending: 0,
      retried: 0,
      'completed-with-retries': 0,
    };
    for (const group of groups) {
      if (group.isPending) tally.pending++;
      if (!isGroupRetried(group)) continue;
      tally.retried++;
      if (getGroupClassification(group) === 'Completed') {
        tally['completed-with-retries']++;
      }
    }
    return tally;
  });

  const selectedCategories = $derived(
    $eventTypeFilter.filter((category) => allCategories.includes(category)),
  );

  const hiddenCategories = $derived(
    $eventTypeFilter.filter((category) => !allCategories.includes(category)),
  );

  const commit = (filters: {
    categories?: EventTypeCategory[];
    classifications?: EventClassification[];
    attributes?: EventGroupAttribute[];
  }) => {
    clearActiveGroups();
    const categories = filters.categories && [
      ...filters.categories,
      ...hiddenCategories,
    ];

    if (categories) $eventTypeFilter = categories;
    if (filters.classifications)
      $eventClassificationFilter = filters.classifications;
    if (filters.attributes) $eventAttributeFilter = filters.attributes;
    updateEventFilterParams(
      page.url,
      {
        categories:
          categories &&
          (categories.length === allEventTypeOptions.length
            ? null
            : categories),
        classifications:
          filters.classifications &&
          (filters.classifications.length ===
          filterableEventClassifications.length
            ? null
            : filters.classifications),
        attributes: filters.attributes,
      },
      goto,
    );
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const onCategoryClick = (value: EventTypeCategory) =>
    commit({ categories: toggle(selectedCategories, value) });

  const onClassificationClick = (value: EventClassification) =>
    commit({ classifications: toggle($eventClassificationFilter, value) });

  const onAttributeClick = (value: EventGroupAttribute) =>
    commit({ attributes: toggle($eventAttributeFilter, value) });
</script>

{#snippet facet(
  label: string,
  groupLabel: string,
  chips: Snippet,
  bulk?: Snippet,
)}
  <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
    <div
      class="flex shrink-0 flex-row items-center gap-2 md:w-24 md:flex-col md:items-start md:gap-0.5"
    >
      <span class="text-xs font-semibold text-primary">{label}</span>
      {#if bulk}
        <div class="flex items-center gap-2">{@render bulk()}</div>
      {/if}
    </div>
    <div
      role="group"
      aria-label={groupLabel}
      class="flex flex-wrap items-center gap-1.5"
    >
      {@render chips()}
    </div>
  </div>
{/snippet}

{#snippet bulkButton(label: string, disabled: boolean, onclick: () => void)}
  <button
    type="button"
    {disabled}
    {onclick}
    class="text-xs text-secondary underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-40"
  >
    {label}
  </button>
{/snippet}

{#snippet categoryBulk()}
  {@render bulkButton(
    translate('common.all'),
    selectedCategories.length === allCategories.length,
    () => commit({ categories: allCategories }),
  )}
  {@render bulkButton(
    translate('common.none'),
    selectedCategories.length === 0,
    () => commit({ categories: [] }),
  )}
{/snippet}

{#snippet statusBulk()}
  {@render bulkButton(
    translate('common.all'),
    $eventClassificationFilter.length === filterableEventClassifications.length,
    () => commit({ classifications: [...filterableEventClassifications] }),
  )}
  {@render bulkButton(
    translate('events.legend-filter.clear'),
    $eventClassificationFilter.length === 0,
    () => commit({ classifications: [] }),
  )}
{/snippet}

{#snippet viewButtons()}
  <ToggleButtons>
    {#each views as view (view.id)}
      <ToggleButton
        active={view.active}
        data-testid={view.id}
        leadingIcon={view.icon}
        size="xs"
        on:click={view.onSelect}
      >
        {view.label}
      </ToggleButton>
    {/each}
  </ToggleButtons>
{/snippet}

{#snippet categoryChips()}
  {#each categoryOptions as option (option.value)}
    {@const total = categoryCounts[option.value] ?? 0}
    {@const pressed = selectedCategories.includes(option.value)}
    <button
      type="button"
      aria-pressed={pressed}
      disabled={hasCounted && total === 0}
      onclick={() => onCategoryClick(option.value)}
      class={chipClass({ pressed })}
    >
      <Icon
        name={option.icon}
        class={merge(
          'h-3.5 w-3.5 shrink-0',
          eventCategoryColor({ category: option.value }),
        )}
      />
      <span class="whitespace-nowrap">{option.label}</span>
      <span class="tabular-nums opacity-60">{total}</span>
    </button>
  {/each}
{/snippet}

{#snippet classificationChips()}
  {#each classificationOptions as option (option.value)}
    {@const pressed = $eventClassificationFilter.includes(option.value)}
    <button
      type="button"
      aria-pressed={pressed}
      disabled={hasCounted && option.total === 0}
      onclick={() => onClassificationClick(option.value)}
      class={chipClass({ pressed })}
    >
      <span
        class="inline-block h-2.5 w-2.5 shrink-0 rounded-full border-2"
        style:background={option.colors.fill}
        style:border-color={option.colors.stroke}
      ></span>
      <span class="whitespace-nowrap">{option.label}</span>
      <span class="tabular-nums opacity-60">{option.total}</span>
    </button>
  {/each}
{/snippet}

{#snippet attributeChips()}
  {#each attributeOptions as option (option.value)}
    {@const total = attributeCounts[option.value] ?? 0}
    {@const pressed = $eventAttributeFilter.includes(option.value)}
    <button
      type="button"
      aria-pressed={pressed}
      disabled={hasCounted && total === 0 && !pressed}
      onclick={() => onAttributeClick(option.value)}
      class={chipClass({ pressed })}
    >
      {#if option.value === 'completed-with-retries'}
        <span
          class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style:background="linear-gradient(255deg, {getStatusStrokeColor(
            'Completed',
          )} 0%, #F55 100%)"
        ></span>
      {:else if option.value === 'retried'}
        <Icon name="retry" class="h-3.5 w-3.5 shrink-0" />
      {:else}
        <span
          class="h-0.5 w-5 shrink-0 rounded-full [background-image:repeating-linear-gradient(to_right,currentColor_0_3px,transparent_3px_6px)] [background-size:6px_100%]"
        ></span>
      {/if}
      <span class="whitespace-nowrap">{option.label}</span>
      <span class="tabular-nums opacity-60">{total}</span>
    </button>
  {/each}
{/snippet}

<div class="flex flex-col gap-2 py-2">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-8">
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      {#if facets.includes('event-type')}
        {@render facet(
          translate('events.legend-filter.event-type-facet'),
          translate('events.legend-filter.filter-by-event-type'),
          categoryChips,
          categoryBulk,
        )}
      {/if}
      {#if views.length}
        {@render facet(
          translate('events.legend-filter.view-facet'),
          translate('events.legend-filter.view-facet'),
          viewButtons,
        )}
      {/if}
      {#if facets.includes('status')}
        {@render facet(
          translate('events.legend-filter.status-facet'),
          translate('events.legend-filter.filter-by-status'),
          classificationChips,
          statusBulk,
        )}
      {/if}
      {#if facets.includes('refine')}
        {@render facet(
          translate('events.legend-filter.refine-facet'),
          translate('events.legend-filter.refine-results'),
          attributeChips,
        )}
      {/if}
    </div>
    {#if toggles.length || actions.length}
      <div
        role="group"
        aria-label={translate('events.legend-filter.view-settings')}
        class="flex shrink-0 flex-col gap-1.5 border-t border-subtle pt-2 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
      >
        {#if actions.length}
          <div
            class={merge(
              'flex flex-wrap items-center gap-2',
              toggles.length && 'border-b border-subtle pb-2',
            )}
          >
            {#each actions as action (action.id)}
              <Button
                variant="secondary"
                size="xs"
                leadingIcon={action.icon}
                disabled={action.disabled}
                data-testid={action.id}
                on:click={action.onClick}
              >
                {action.label}
              </Button>
            {/each}
          </div>
        {/if}
        {#each toggles as toggle (toggle.id)}
          <div class="flex items-center justify-between gap-3">
            <span
              class={merge(
                'flex items-center gap-1.5 text-xs text-secondary',
                toggle.disabled && 'opacity-50',
              )}
            >
              {#if toggle.liveIndicator}
                <span
                  class={merge(
                    'h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300',
                    toggle.checked && 'bg-green-600',
                  )}
                ></span>
              {:else if toggle.icon}
                <Icon name={toggle.icon} class="h-3.5 w-3.5 shrink-0" />
              {/if}
              {toggle.label}
            </span>
            <ToggleSwitch
              id={toggle.id}
              data-testid={toggle.id}
              label={toggle.label}
              labelHidden
              checked={toggle.checked}
              disabled={toggle.disabled}
              on:change={toggle.onChange}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
