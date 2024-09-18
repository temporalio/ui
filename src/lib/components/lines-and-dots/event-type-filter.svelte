<script lang="ts">
  import { page } from '$app/stores';

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
  import { nexusEnabled } from '$lib/utilities/nexus-enabled';
  import { isVersionNewer } from '$lib/utilities/version-check';
  // import {
  //   Menu,
  //   MenuButton,
  //   MenuContainer,
  //   MenuDivider,
  //   MenuItem,
  // } from '$lib/holocene/menu';

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
    if (!nexusEnabled($page.data.systemInfo?.capabilities)) {
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
  <!-- 
  <MenuContainer {open} on:close={resetFilter}>
    <MenuButton
      controls="status-menu"
      on:click={() => {
        if ($open) resetFilter();
      }}
    >
      {$filter.attribute}
    </MenuButton>
    <Menu id="status-menu" keepOpen>
      {#each options as option}
        {@const checked =
          $eventTypeFilter.some((filter) => filter === option.value) ||
          (!$eventTypeFilter.length && option.value === 'All')}
        <MenuItem
          data-testid={option.value}
          on:click={() => {
            onStatusClick(status);
          }}
        >
          <Checkbox
            on:click={() => onStatusClick(status)}
            slot="leading"
            {checked}
            label={status}
            labelHidden
          />
        </MenuItem>
      {/each}
      <MenuDivider />
    </Menu>
  </MenuContainer> -->
</div>
