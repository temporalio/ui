<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type SavedQuery } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    view?: SavedQuery;
    onSaveView: (view: SavedQuery) => void;
    onCreateView: (view: SavedQuery) => void;
  }

  let { open = $bindable(), view, onSaveView, onCreateView }: Props = $props();

  let name = $derived(view?.name || '');
  const query = $derived(page.url.searchParams.get('query'));

  const hideModal = () => {
    open = false;
    name = '';
  };

  const onCreateAsNew = (event: Event) => {
    event.preventDefault();
    const updatedView = {
      id: Date.now().toString(),
      name: name === view?.name ? name + ' (copy)' : name,
      query,
      type: 'user',
    };
    onCreateView(updatedView);
    hideModal();
  };

  const onSave = (event: Event) => {
    event.preventDefault();
    const updatedView = {
      ...view,
      name,
      query,
      type: 'user',
    };
    onSaveView(updatedView);
    hideModal();
  };
</script>

<Modal
  bind:open
  id="save-view-modal"
  confirmText={translate('common.save')}
  cancelText={translate('common.close')}
  on:cancelModal={close}
  on:confirmModal={onSave}
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
    <Button variant="secondary" class="mt-4 self-start" on:click={onCreateAsNew}
      >Create New</Button
    >
  </div>
</Modal>
