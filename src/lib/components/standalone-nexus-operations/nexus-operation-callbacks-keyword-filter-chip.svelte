<script lang="ts">
  import { writable } from 'svelte/store';

  import { onMount } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTrash } from '$lib/io/icon';
  import {
    CALLBACK_KEYWORD_OPERATORS,
    type CallbackKeywordField,
    type CallbackKeywordFilter,
    type CallbackKeywordOperator,
  } from '$lib/utilities/nexus-operation-callback-filters';

  type Props = {
    field: CallbackKeywordField;
    label: string;
    filter: CallbackKeywordFilter | null;
    openOnMount?: boolean;
    onApply: (filter: CallbackKeywordFilter | null) => void;
    onDismiss: () => void;
  };

  let {
    field,
    label,
    filter,
    openOnMount = false,
    onApply,
    onDismiss,
  }: Props = $props();

  const open = writable(false);
  let operator = $state<CallbackKeywordOperator>('=');
  let value = $state('');
  let wasOpen = false;
  let applied = false;

  const controlsId = $derived(`callbacks-filter-chip-${field}`);

  const operatorLabels: Record<CallbackKeywordOperator, string> = {
    '=': translate('common.equal-to'),
    '!=': translate('common.not-equal-to'),
    STARTS_WITH: translate('common.starts-with'),
  };

  const chipOperator = (operator: CallbackKeywordOperator) =>
    operator === 'STARTS_WITH'
      ? translate('common.starts-with').toLowerCase()
      : operator;

  const close = (next: CallbackKeywordFilter | null) => {
    applied = true;
    onApply(next);
    $open = false;
  };

  const apply = (event: SubmitEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    close(trimmed ? { operator, value: trimmed } : null);
  };

  onMount(() => {
    if (openOnMount) $open = true;
  });

  $effect(() => {
    if ($open) {
      if (!wasOpen) {
        operator = filter?.operator ?? '=';
        value = filter?.value ?? '';
      }
      wasOpen = true;
      return;
    }
    if (!wasOpen) return;
    wasOpen = false;
    if (!applied) onDismiss();
    applied = false;
  });
</script>

<MenuContainer {open} class="min-w-0 max-w-full">
  <MenuButton
    size="xs"
    controls={controlsId}
    hasIndicator
    class="h-auto min-h-8 min-w-0 max-w-full whitespace-normal bg-surface-secondary"
    title={filter
      ? `${label} ${chipOperator(filter.operator)} ${filter.value}`
      : label}
  >
    <div class="min-w-0 text-left">
      <span class="break-words text-primary"
        >{label}
        {filter ? chipOperator(filter.operator) : ''}</span
      >
      <span class="break-all text-brand">{filter?.value ?? ''}</span>
    </div>
  </MenuButton>
  <Menu
    id={controlsId}
    usePortal
    keepOpen
    class="max-h-fit w-80 min-w-0 max-w-[calc(100dvw-1rem)] p-4"
  >
    <form class="space-y-3" onsubmit={apply}>
      <h3 class="text-sm font-medium">
        {translate('nexus.filter-by-field', { field: label })}
      </h3>
      <ToggleButtons>
        {#each CALLBACK_KEYWORD_OPERATORS as option (option)}
          <ToggleButton
            variant="secondary"
            size="xs"
            active={operator === option}
            data-testid="callbacks-filter-operator"
            onclick={() => (operator = option)}
            >{operatorLabels[option]}</ToggleButton
          >
        {/each}
      </ToggleButtons>
      <Input
        id="{controlsId}-value"
        label={translate('common.value')}
        labelHidden
        placeholder="{translate('common.enter')} {label}"
        autoFocus
        bind:value
      />
      <div class="flex justify-end gap-2">
        {#if filter}
          <Button
            TrailingIcon={IconTrash}
            variant="secondary"
            size="xs"
            type="button"
            data-testid="callbacks-filter-remove"
            onclick={() => close(null)}
          >
            {translate('common.remove')}
          </Button>
        {/if}
        <Button
          variant="primary"
          size="xs"
          type="submit"
          data-testid="callbacks-filter-apply"
        >
          {translate('common.apply')}
        </Button>
      </div>
    </form>
  </Menu>
</MenuContainer>
