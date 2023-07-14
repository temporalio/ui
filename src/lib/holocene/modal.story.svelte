<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import { logEvent } from 'histoire/client';
  
  import Button from './button.svelte';
  import Input from './input/input.svelte';
  import Modal from './modal.svelte';

  export let Hst: HST;
  let deleteConfirm: string;
  let modal: Modal;
  let loading = false;

  let shouldError = false;
  let errorText =
    'Quo sint nisi nostrum quis nesciunt est. Delectus adipisci reiciendis nihil fuga libero exercitationem. Distinctio nihil sit et consequatur sit quia. Quia aut et temporibus doloremque veritatis corporis.';
  const openModal = () => {
    modal.open();
  };

  const handleConfirm = () => {
    logEvent('Confirm', {});
  };

  const handleCancel = () => {
    logEvent('Cancel', {});
  };

  const makeFakeApiRequest = async () => {
    try {
      loading = true;
      await new Promise<void>((resolve, reject) => {
        if (shouldError) {
          setTimeout(reject, 250);
        } else {
          setTimeout(resolve, 250);
        }
      });
      modal?.close();
    } catch {
      modal?.setError(errorText);
    } finally {
      loading = false;
    }
  };
</script>

<Hst.Story>
  <Hst.Variant title="A Basic Confirmation Modal">
    <Button on:click={openModal}>Open Modal</Button>
    <Modal
      bind:this={modal}
      id="basic-modal"
      confirmType="destructive"
      confirmText="Delete"
      on:confirmModal={handleConfirm}
      on:cancelModal={handleCancel}
    >
      <h3 slot="title">Delete User</h3>
      <p slot="content">
        Are you sure you want to delete <strong>tobias@temporal.io</strong>?
      </p>
    </Modal>
  </Hst.Variant>
  <Hst.Variant title="A Modal with a Form">
    <Button on:click={openModal}>Open Modal</Button>
    <Modal
      id="form-modal"
      bind:this={modal}
      confirmType="destructive"
      confirmText="Delete"
      {loading}
      on:cancelModal={handleCancel}
      on:confirmModal={makeFakeApiRequest}
    >
      <h3 slot="title">Delete Namespace</h3>
      <div slot="content" class="flex flex-col gap-2">
        <p>Are you sure you want to delete this namespace?</p>
        <Input
          id="delete-confirm"
          bind:value={deleteConfirm}
          label="type 'DELETE' to confirm"
        />
      </div>
    </Modal>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value={shouldError} title="Should Error: " />
    <Hst.Text bind:value={errorText} title="Error Text: " />
  </svelte:fragment>
</Hst.Story>
