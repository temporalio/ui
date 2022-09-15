<script lang="ts">
  import Button from './button.svelte';

  import Modal from './modal.svelte';

  export let Hst;
  let open = true;
</script>

<Hst.Story>
  <Modal
    {open}
    confirmType="destructive"
    confirmText="Delete"
    on:confirmModal={() => (open = false)}
    on:cancelModal={() => (open = false)}
  >
    <h3 slot="title">Delete User</h3>
    <p slot="content">
      Are you sure you want to delete <strong>tobias@temporal.io</strong>?
    </p>
  </Modal>

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Open: " bind:value={open} />
  </svelte:fragment>
</Hst.Story>
