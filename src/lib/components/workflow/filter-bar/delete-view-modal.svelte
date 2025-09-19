<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type SavedQuery } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    view: SavedQuery;
    onDeleteView: () => void;
  }

  let { open = $bindable(), view, onDeleteView }: Props = $props();

  const hideModal = () => {
    open = false;
  };

  const onDelete = (event: Event) => {
    event.preventDefault();
    onDeleteView();
    hideModal();
  };
</script>

<Modal
  bind:open
  id="delete-view-modal"
  confirmText={translate('common.delete')}
  cancelText={translate('common.close')}
  on:cancelModal={close}
  on:confirmModal={onDelete}
>
  <h3 slot="title">Delete View</h3>
  <p slot="content">Are you sure you want to delete {view?.name}?</p>
</Modal>
