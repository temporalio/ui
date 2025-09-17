<script lang="ts">
  import { page } from '$app/state';

  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  interface Props {
    open?: boolean;
    view: SavedQuery;
  }

  let { open = $bindable(), view: savedQueryView }: Props = $props();

  const namespace = $derived(page.params.namespace);

  const hideModal = () => {
    open = false;
  };

  const onDeleteView = (event: Event) => {
    event.preventDefault();
    $savedQueries[namespace] = $savedQueries[namespace].filter(
      (q) => q.id !== savedQueryView.id,
    );
    $workflowFilters = [];
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: '',
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
    hideModal();
  };
</script>

<Modal
  bind:open
  id="delete-view-modal"
  confirmText={translate('common.delete')}
  cancelText={translate('common.close')}
  on:cancelModal={close}
  on:confirmModal={onDeleteView}
>
  <h3 slot="title">Delete View</h3>
  <p slot="content">Are you sure you want to delete {savedQueryView?.name}?</p>
</Modal>
