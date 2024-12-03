<script lang="ts">
  import IsTemporalServerVersionGuard from '$lib/components/is-temporal-server-version-guard.svelte';
  import SearchAttributeFilter from '$lib/components/search-attribute-filter/index.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { showChildWorkflows, workflowFilters } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { refresh } from '$lib/stores/workflows';
  import { canFetchChildWorkflows, workflows } from '$lib/stores/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';

  export let onClickConfigure: () => void;
</script>

<SearchAttributeFilter
  showFilter={!$searchInputViewOpen}
  bind:filters={$workflowFilters}
  refresh={() => {
    $refresh = Date.now();
  }}
>
  {#if $searchInputViewOpen}
    <WorkflowAdvancedSearch />
  {/if}
  <svelte:fragment slot="actions">
    <MenuContainer>
      <MenuButton
        controls="filter-configuration-menu"
        count={Number($searchInputViewOpen) +
          Number($canFetchChildWorkflows && $showChildWorkflows)}
        data-testid="filter-configuration-menu-button"
        class="max-w-[3rem] text-nowrap md:max-w-full"
      >
        {#snippet leading()}
          <Icon name="settings" />
        {/snippet}
      </MenuButton>
      <Menu id="filter-configuration-menu" position="right">
        <div class="flex flex-col items-start gap-4 p-4 md:items-end">
          <IsTemporalServerVersionGuard minimumVersion="1.23.0">
            <ToggleSwitch
              data-testid="show-child-workflow-toggle"
              label={translate('workflows.show-children')}
              labelPosition="left"
              id="show-child-workflow-input"
              bind:checked={$showChildWorkflows}
            />
          </IsTemporalServerVersionGuard>
          <ToggleSwitch
            data-testid="manual-search-toggle"
            label={translate('workflows.view-search-input')}
            labelPosition="left"
            id="view-search-input"
            bind:checked={$searchInputViewOpen}
          />
          <MenuItem
            on:click={onClickConfigure}
            className="m-0"
            data-testid="workflows-summary-table-configuration-button"
          >
            {translate('workflows.configure-headers', {
              title: translate('common.workflows', { count: 2 }),
            })}
          </MenuItem>
          <MenuItem
            on:click={() => exportWorkflows($workflows)}
            className="m-0"
            data-testid="export-history-button"
          >
            {translate('common.download-json')}
            <Icon name="download" />
          </MenuItem>
        </div>
      </Menu>
    </MenuContainer>
  </svelte:fragment>
</SearchAttributeFilter>
