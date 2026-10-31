<script lang="ts">
  import { writable } from 'svelte/store';

  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { StatusAttribute } from '$lib/utilities/query/quick-filter';

  import StatusFilterEditor from './status-filter-editor.svelte';

  interface Props {
    attribute: StatusAttribute;
    filters: SearchAttributeFilter[];
    onUpdate: (updatedFilter: SearchAttributeFilter[]) => void;
    index?: number;
    openIndex?: number | null;
  }

  let {
    attribute,
    filters,
    onUpdate,
    index = 0,
    openIndex = null,
  }: Props = $props();

  const open = writable(false);

  const controlsId = $derived(
    `dropdown-filter-chip-${attribute.toLowerCase()}`,
  );

  const statusValues = $derived(filters.map((f) => f.value).join(', '));

  $effect(() => {
    if (openIndex === index) {
      $open = true;
    }
  });
</script>

<MenuContainer {open} class="min-w-0 max-w-full">
  <MenuButton
    size="xs"
    controls={controlsId}
    hasIndicator
    class="h-auto min-h-8 min-w-0 max-w-full whitespace-normal bg-surface-secondary"
    title="{attribute} = {statusValues}"
  >
    <div class="min-w-0 text-left">
      <span class="break-words text-primary">{attribute} =</span>
      <span class="break-all text-brand">{statusValues}</span>
    </div>
  </MenuButton>

  <Menu id={controlsId} usePortal class="max-h-fit w-80 max-w-fit p-4" keepOpen>
    <StatusFilterEditor {attribute} {filters} {onUpdate} />
  </Menu>
</MenuContainer>
