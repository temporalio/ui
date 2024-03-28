<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
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
    }),
  );

  $: {
    if (isVersionNewer('1.21', $temporalVersion)) {
      options = options.filter(({ value }) => value !== 'update');
    }
  }

  const onOptionClick = ({ value }) => {
    $eventTypeFilter = $eventTypeFilter.some((type) => type === value)
      ? $eventTypeFilter.filter((type) => type !== value)
      : [...$eventTypeFilter, value];
  };
</script>

<div class="flex flex-wrap items-center justify-center gap-2">
  {#each options as option}
    <div class="flex items-center gap-2">
      <input
        type="checkbox"
        on:click={() => onOptionClick(option)}
        checked={$eventTypeFilter.some((type) => type === option.value)}
      />
      <div
        role="button"
        tabindex="0"
        class="flex cursor-pointer select-none items-center gap-2 text-sm"
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
  {/each}
</div>
