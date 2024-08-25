<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { clearActiveEvents } from '$lib/stores/active-events';
  import { eventTypeFilter } from '$lib/stores/filters';
  import { temporalVersion } from '$lib/stores/versions';
  import { isVersionNewer } from '$lib/utilities/version-check';

  import { CategoryIcon } from './constants';

  export let compact = false;

  $: options = (compact ? compactEventTypeOptions : allEventTypeOptions).map(
    (o) => ({
      ...o,
      label: translate(o.label),
      icon: CategoryIcon[o.value],
      tooltip: translate(o.tooltip),
    }),
  );

  $: {
    if (isVersionNewer('1.21.0', $temporalVersion)) {
      options = options.filter(({ value }) => value !== 'update');
    }
  }

  $: {
    if (isVersionNewer('1.25.0', $temporalVersion)) {
      options = options.filter(({ value }) => value !== 'nexus');
    }
  }

  const onOptionClick = ({ value }) => {
    clearActiveEvents();
    $eventTypeFilter = $eventTypeFilter.some((type) => type === value)
      ? $eventTypeFilter.filter((type) => type !== value)
      : [...$eventTypeFilter, value];
  };
</script>

<div class="flex flex-wrap items-center items-center justify-center gap-4">
  {#each options as option}
    <Tooltip width={200} text={option.tooltip} topRight>
      <div class="flex items-center">
        <Checkbox
          type="checkbox"
          on:click={() => onOptionClick(option)}
          checked={$eventTypeFilter.some((type) => type === option.value)}
        />
        <div
          role="button"
          tabindex="0"
          class="flex cursor-pointer select-none items-center text-sm"
          on:click={() => onOptionClick(option)}
          on:keydown={(e) => e.key === 'Enter' && onOptionClick(option)}
        >
          {#if option.icon}
            <span class="lg:hidden"
              ><Icon slot="trailing" name={option.icon} /></span
            >
          {/if}
          <span class="hidden lg:block">{option.label}</span>
        </div>
      </div>
    </Tooltip>
  {/each}
</div>
