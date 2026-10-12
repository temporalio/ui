<script lang="ts">
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronDown, IconEllipsisVertical } from '$lib/io/icon';

  interface Props {
    buildId: string;
    /** Opens the details drawer. Omitted inside the drawer itself. */
    detailsHref?: string;
    /**
     * Inside the details drawer: no table cell, and the menu renders in place
     * so it stays inside the drawer's focus trap. Edit and View workflows are
     * buttons in the drawer header there.
     */
    inDrawer?: boolean;
    editHref: string;
    workflowHref: string;
    isCurrent: boolean;
    hasComputeConfig: boolean;
    isRamping: boolean;
    onSetCurrent: () => void;
    onSetRamping: () => void;
    onUnsetCurrent: () => void;
    onValidate: () => void;
    onDelete: () => void;
  }

  let {
    buildId,
    detailsHref,
    inDrawer = false,
    editHref,
    workflowHref,
    isCurrent,
    hasComputeConfig,
    isRamping,
    onSetCurrent,
    onSetRamping,
    onUnsetCurrent,
    onValidate,
    onDelete,
  }: Props = $props();
</script>

{#snippet menu()}
  <MenuContainer>
    {#if inDrawer}
      <MenuButton
        controls="version-actions-{buildId}-details"
        variant="tertiary"
        size="xs"
      >
        {translate('deployments.details-more')}
        {#snippet trailing()}
          <IconChevronDown class="h-4 w-4" />
        {/snippet}
      </MenuButton>
    {:else}
      <MenuButton
        label="Actions"
        controls="version-actions-{buildId}"
        variant="ghost"
        size="xs"
        class="flex h-8 w-8 items-center justify-center"
      >
        <IconEllipsisVertical class="h-4 w-4" />
      </MenuButton>
    {/if}
    <Menu
      id="version-actions-{buildId}{inDrawer ? '-details' : ''}"
      position={inDrawer ? 'top-right' : 'right'}
      usePortal={!inDrawer}
      class="min-w-max"
    >
      {#if detailsHref}
        <MenuItem href={detailsHref} data-sveltekit-noscroll>
          {translate('deployments.details-view')}
        </MenuItem>
      {/if}
      {#if hasComputeConfig && !inDrawer}
        <MenuItem href={editHref}>
          {translate('deployments.edit')}
        </MenuItem>
      {/if}
      {#if isCurrent}
        <MenuItem onclick={onUnsetCurrent}>
          {translate('deployments.unset-current')}
        </MenuItem>
      {:else}
        <MenuItem onclick={onSetCurrent}>
          {translate('deployments.set-as-current')}
        </MenuItem>
      {/if}
      <MenuItem onclick={onSetRamping} disabled={isCurrent}>
        {isRamping
          ? translate('deployments.edit-ramping-percentage')
          : translate('deployments.set-ramping-version')}
      </MenuItem>
      {#if hasComputeConfig}
        <MenuItem onclick={onValidate}>
          {translate('deployments.validate-connection')}
        </MenuItem>
      {/if}
      {#if !inDrawer}
        <MenuItem href={workflowHref}>
          {translate('deployments.view-workflows')}
        </MenuItem>
      {/if}
      <MenuItem onclick={onDelete} destructive>
        {translate('common.delete')}
      </MenuItem>
    </Menu>
  </MenuContainer>
{/snippet}

{#if inDrawer}
  {@render menu()}
{:else}
  <td class="w-24 whitespace-pre-line break-words">
    {@render menu()}
  </td>
{/if}
