<script lang="ts">
  import { page } from '$app/state';

  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type SavedQuery } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    onCreateView: (view: SavedQuery) => void;
  }

  let { open = $bindable(), onCreateView }: Props = $props();

  let name = $state('');
  const query = $derived(page.url.searchParams.get('query'));

  const hideModal = () => {
    open = false;
    name = '';
  };

  const onSave = (event: Event) => {
    event.preventDefault();

    const newView = {
      id: Date.now().toString(),
      name,
      query,
      type: 'user',
    };

    onCreateView(newView);
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
  <h3 slot="title">Save as View</h3>
  <div class="flex h-full flex-1 flex-col" slot="content">
    <Input
      id="view-name"
      label="Name"
      required
      maxLength={255}
      bind:value={name}
      placeholder="Name of view"
      class="w-full"
    />
  </div>
</Modal>
