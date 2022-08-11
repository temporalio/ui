<script lang="ts">
  import Modal from '$holocene/modal.svelte';
  import Button from '$holocene/button.svelte';
  import Chapter from '../_chapter.svelte';

  let open = false;
</script>

<Chapter description="A modal">
  <Button on:click={() => (open = true)}>Open Modal</Button>

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
</Chapter>
