<script lang="ts">
  import { writable } from 'svelte/store';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    buildId: string;
    editHref: string;
    workflowHref: string;
    onValidate: () => void;
    onDelete: () => void;
  }

  let { buildId, editHref, workflowHref, onValidate, onDelete }: Props =
    $props();

  const menuOpen = writable(false);
</script>

<td class="w-24 whitespace-pre-line break-words">
  <MenuContainer open={menuOpen}>
    {#snippet children(open)}
      <button
        type="button"
        aria-label="Actions"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="version-actions-{buildId}"
        onclick={() => menuOpen.update((v) => !v)}
        class="flex h-8 w-8 items-center justify-center rounded hover:surface-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      >
        <Icon name="vertical-ellipsis" class="h-4 w-4" />
      </button>
      <Menu id="version-actions-{buildId}" position="right" usePortal>
        <CapabilityGuard capability="serverScaledDeployments">
          <MenuItem href={editHref}>
            {translate('deployments.edit')}
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
          <MenuItem onclick={onDelete}>
            {translate('common.delete')}
          </MenuItem>
        </CapabilityGuard>
      </Menu>
    {/snippet}
  </MenuContainer>
</td>
