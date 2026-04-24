<script lang="ts">
  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    editHref: string;
    workflowHref: string;
    isCurrent: boolean;
    onSetCurrent: () => void;
    onValidate: () => void;
    onDelete: () => void;
  }

  let {
    buildId,
    editHref,
    workflowHref,
    isCurrent,
    onSetCurrent,
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
      <Icon name="vertical-ellipsis" class="h-4 w-4" />
    </MenuButton>
    <Menu id="version-actions-{buildId}" position="right" usePortal>
      <CapabilityGuard capability="serverScaledDeployments">
        <MenuItem href={editHref}>
          {translate('deployments.edit')}
        </MenuItem>
      </CapabilityGuard>
      <CapabilityGuard capability="serverScaledDeployments">
        <MenuItem onclick={onSetCurrent} disabled={isCurrent}>
          {translate('deployments.set-as-current')}
        </MenuItem>
      </CapabilityGuard>
      <CapabilityGuard capability="serverScaledDeployments">
        <MenuItem onclick={onValidate}>
          {translate('deployments.validate-connection')}
        </MenuItem>
      </CapabilityGuard>
      <MenuItem href={workflowHref}>
        {translate('deployments.view-workflows')}
      </MenuItem>
      <CapabilityGuard capability="serverScaledDeployments">
        <MenuItem onclick={onDelete} destructive>
          {translate('common.delete')}
        </MenuItem>
      </CapabilityGuard>
    </Menu>
  </MenuContainer>
</td>
