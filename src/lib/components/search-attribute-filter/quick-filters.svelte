<script module lang="ts">
  import type { IconName } from '$lib/holocene/icon';

  export type QuickFilter = {
    label: string;
    icon?: IconName;
    checked: boolean;
    onClick: () => void;
  };
</script>

<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    filters: QuickFilter[];
    showQuickFilters: Writable<boolean>;
    open?: Writable<boolean> | null;
  }

  const { filters, showQuickFilters, open = null }: Props = $props();
</script>

{#if open !== null}
  <MenuContainer {open}>
    <MenuButton controls="quick-filter-menu">
      {translate('workflows.quick-filters')}
    </MenuButton>
    <Menu id="quick-filter-menu" keepOpen>
      {#each filters as { label, checked, onClick } (label)}
        <MenuItem data-testid={label} on:click={onClick}>
          <Checkbox
            on:click={onClick}
            slot="leading"
            {checked}
            {label}
            class="text-nowrap"
          />
        </MenuItem>
      {/each}
      <MenuDivider />
      <div class="m-1 px-3 py-2">
        <ToggleSwitch
          label={translate('workflows.show-quick-filters')}
          id="show-quick-filters"
          checked={$showQuickFilters}
          on:change={() => {
            $showQuickFilters = !$showQuickFilters;
          }}
        />
      </div>
    </Menu>
  </MenuContainer>
{:else if $showQuickFilters}
  <div class="flex flex-wrap gap-2 pt-2">
    {#each filters as { icon, label, checked, onClick } (label)}
      <Button
        variant="secondary"
        size="xs"
        leadingIcon={icon}
        disabled={checked}
        on:click={onClick}
      >
        {label}
      </Button>
    {/each}
  </div>
{/if}
