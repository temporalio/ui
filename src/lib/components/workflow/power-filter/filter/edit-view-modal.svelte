<script lang="ts">
  import { page } from '$app/state';

  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    view?: SavedQuery;
  }

  let { open = $bindable(), view }: Props = $props();

  let name = $state(view?.name ?? '');

  const namespace = $derived(page.params.namespace);
  const query = $derived(page.url.searchParams.get('query'));

  const hideModal = () => {
    open = false;
    name = '';
  };

  const onSaveView = (event: Event) => {
    event.preventDefault();

    const updatedQuery = {
      ...view,
      name,
      query,
    };
    $savedQueries[namespace] = $savedQueries[namespace].map((q) =>
      q.id === view.id ? updatedQuery : q,
    );
    hideModal();
  };
</script>

<Modal
  bind:open
  id="save-view-modal"
  confirmText={translate('common.save')}
  cancelText={translate('common.close')}
  on:cancelModal={close}
  on:confirmModal={onSaveView}
>
  <h3 slot="title">Edit View</h3>
  <div class="flex h-full flex-1 flex-col" slot="content">
    <Input
      id="view-name"
      label="Name"
      required
      bind:value={name}
      placeholder="Name of view"
      class="w-full"
    />
  </div>
</Modal>
