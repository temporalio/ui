<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import { logEvent } from 'histoire/client';

  import Button from './button.svelte';
  import Input from './input/input.svelte';

  import Modal from './modal.svelte';

  export let Hst: HST;
  let open = false;
  let deleteConfirm: string;

  const handleConfirm = () => {
    logEvent('Confirm', {});
    open = false;
  };

  const handleCancel = () => {
    logEvent('Cancel', {});
    open = false;
  };
</script>

<Hst.Story>
  <Button on:click={() => (open = true)}>Open Modal</Button>

  <Hst.Variant title="A Basic Confirmation Modal">
    <Modal
      bind:open
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
    <Modal
      bind:open
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
  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Open: " bind:value={open} />
  </svelte:fragment>
</Hst.Story>
