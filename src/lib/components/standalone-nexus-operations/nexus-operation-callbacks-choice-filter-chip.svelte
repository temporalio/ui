<script lang="ts">
  import { writable } from 'svelte/store';

  import { onMount, untrack } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import Badge from '$lib/io/badge/badge.svelte';
  import type {
    CallbackChoiceField,
    CallbackChoiceOption,
  } from '$lib/utilities/nexus-operation-callback-filters';

  type Props = {
    field: CallbackChoiceField;
    label: string;
    options: CallbackChoiceOption[];
    selected: string[];
    openOnMount?: boolean;
    onChange: (values: string[]) => void;
    onDismiss: () => void;
  };

  let {
    field,
    label,
    options,
    selected,
    openOnMount = false,
    onChange,
    onDismiss,
  }: Props = $props();

  const open = writable(false);
  let pending = $state<string[]>([]);
  let wasOpen = false;

  const controlsId = $derived(`callbacks-filter-chip-${field}`);
  const selectedLabels = $derived(
    options
      .filter(({ value }) => selected.includes(value))
      .map(({ label }) => label)
      .join(', '),
  );

  const toggle = (value: string) => {
    pending = pending.includes(value)
      ? pending.filter((pendingValue) => pendingValue !== value)
      : [...pending, value];
    onChange(pending);
  };

  onMount(() => {
    if (openOnMount) $open = true;
  });

  $effect(() => {
    if ($open) {
      if (!wasOpen) pending = untrack(() => [...selected]);
      wasOpen = true;
      return;
    }
    if (!wasOpen) return;
    wasOpen = false;
    if (!pending.length) onDismiss();
  });
</script>

<MenuContainer {open} class="min-w-0 max-w-full">
  <MenuButton
    size="xs"
    controls={controlsId}
    hasIndicator
    class="h-auto min-h-8 min-w-0 max-w-full whitespace-normal bg-surface-secondary"
    title="{label} = {selectedLabels}"
  >
    <div class="min-w-0 text-left">
      <span class="break-words text-primary">{label} =</span>
      <span class="break-all text-brand">{selectedLabels}</span>
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
      {#each options as option (option.value)}
        <MenuItem onclick={() => toggle(option.value)} class="min-w-0">
          {#snippet leading()}
            <Checkbox
              onclick={() => toggle(option.value)}
              checked={pending.includes(option.value)}
              label={option.label}
              labelHidden
            />
          {/snippet}
          {#if option.colorScheme}
            <Badge text={option.label} colorScheme={option.colorScheme} />
          {:else}
            {option.label}
          {/if}
        </MenuItem>
      {/each}
    </div>
  </Menu>
</MenuContainer>
