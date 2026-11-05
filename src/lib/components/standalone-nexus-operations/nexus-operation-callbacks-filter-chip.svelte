<script lang="ts">
  import { writable } from 'svelte/store';

  import { onMount } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import IconSearch from '$lib/io/icon/icons/search.svelte';
  import {
    type CallbackFilterField,
    type CallbackFilterOption,
    limitCallbackFilterOptions,
    matchesCallbackFilterSearch,
  } from '$lib/utilities/nexus-operation-callback-filters';

  type Props = {
    field: CallbackFilterField;
    label: string;
    options: CallbackFilterOption[];
    selected: string[];
    openOnMount?: boolean;
    onToggle: (value: string) => void;
    onClose: () => void;
  };

  let {
    field,
    label,
    options,
    selected,
    openOnMount = false,
    onToggle,
    onClose,
  }: Props = $props();

  const open = writable(false);
  let search = $state('');
  let wasOpen = false;

  const controlsId = $derived(`callbacks-filter-chip-${field}`);
  const visible = $derived(
    limitCallbackFilterOptions(
      options.filter(({ value }) => matchesCallbackFilterSearch(value, search)),
      selected,
    ),
  );

  onMount(() => {
    if (openOnMount) $open = true;
  });

  $effect(() => {
    if ($open) {
      wasOpen = true;
      return;
    }
    if (!wasOpen) return;
    wasOpen = false;
    search = '';
    onClose();
  });
</script>

<MenuContainer {open} class="min-w-0 max-w-full">
  <MenuButton
    size="xs"
    controls={controlsId}
    hasIndicator
    class="h-auto min-h-8 min-w-0 max-w-full whitespace-normal bg-surface-secondary"
    title="{label} = {selected.join(', ')}"
  >
    <div class="min-w-0 text-left">
      <span class="break-words text-primary">{label} =</span>
      <span class="break-all text-brand">{selected.join(', ')}</span>
    </div>
  </MenuButton>
  <Menu
    id={controlsId}
    usePortal
    keepOpen
    class="max-h-fit w-80 min-w-0 max-w-[calc(100dvw-1rem)] p-4"
  >
    <div class="space-y-2">
      <h3 class="text-sm font-medium">
        {translate('nexus.filter-by-field', { field: label })}
      </h3>
      <Input
        id="{controlsId}-search"
        bind:value={search}
        label={translate('common.search')}
        labelHidden
        Icon={IconSearch}
        type="search"
        placeholder={`${translate('common.search')}…`}
        clearable
        clearButtonLabel={translate('common.clear-input-button-label')}
      />
      {#each visible as { value, count } (value)}
        {@const checked = selected.includes(value)}
        <MenuItem onclick={() => onToggle(value)} class="min-w-0">
          {#snippet leading()}
            <Checkbox
              onclick={() => onToggle(value)}
              {checked}
              label={value}
              labelHidden
            />
          {/snippet}
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <span class="min-w-0 flex-1 whitespace-normal break-words"
              >{value}</span
            >
            <span class="shrink-0 text-xs text-secondary">{count}</span>
          </div>
        </MenuItem>
      {:else}
        <p class="px-3 py-2 text-sm text-secondary">
          {translate('common.no-results')}
        </p>
      {/each}
    </div>
  </Menu>
</MenuContainer>
