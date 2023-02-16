<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import { logEvent } from 'histoire/client';

  import Button from './button.svelte';
  import Input from './input/input.svelte';

  import Modal from './modal.svelte';

  export let Hst: HST;
  let deleteConfirm: string;
  let modal: Modal;

  const openModal = () => {
    modal.open();
  };

  const handleConfirm = () => {
    logEvent('Confirm', {});
  };

  const handleCancel = () => {
    logEvent('Cancel', {});
  };
</script>

<Hst.Story>
  <Hst.Variant title="A Basic Confirmation Modal">
    <Button on:click={openModal}>Open Modal</Button>
    <Modal
      bind:this={modal}
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
      bind:this={modal}
      confirmType="destructive"
      confirmText="Delete"
      on:cancelModal={handleCancel}
      on:confirmModal={handleConfirm}
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
</Hst.Story>
