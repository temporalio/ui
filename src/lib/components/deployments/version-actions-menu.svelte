<script lang="ts">
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconEllipsisVertical } from '$lib/io/icon';

  interface Props {
    buildId: string;
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

<td class="w-24 whitespace-pre-line break-words">
  <MenuContainer>
    <MenuButton
      label="Actions"
      controls="version-actions-{buildId}"
      variant="ghost"
      size="xs"
      class="flex h-8 w-8 items-center justify-center"
    >
      <IconEllipsisVertical class="h-4 w-4" />
    </MenuButton>
    <Menu id="version-actions-{buildId}" position="right" usePortal>
      {#if hasComputeConfig}
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
      <MenuItem href={workflowHref}>
        {translate('deployments.view-workflows')}
      </MenuItem>
      <MenuItem onclick={onDelete} destructive>
        {translate('common.delete')}
      </MenuItem>
    </Menu>
  </MenuContainer>
</td>
