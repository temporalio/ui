<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { Button } from '$lib/io/button';

  let open = $state(false);
  let reason = $state('');
  let error = $state('');
  let loading = $state(false);
  let failRequest = $state(true);
  let result = $state('');

  // Stands in for a service call such as terminateWorkflow.
  const request = () =>
    new Promise<void>((resolve, reject) =>
      setTimeout(
        () =>
          failRequest
            ? reject(new Error('The server could not terminate the workflow.'))
            : resolve(),
        800,
      ),
    );

  const hideModal = () => {
    open = false;
    reason = '';
  };

  const terminate = async () => {
    error = '';
    loading = true;
    try {
      await request();
      open = false;
      reason = '';
      result = 'Workflow terminated.';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Something went wrong.';
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex flex-col items-start gap-4">
  <label class="flex items-center gap-2 text-sm">
    <input type="checkbox" bind:checked={failRequest} />
    Make the request fail, to see error handling
  </label>
  <Button
    colorScheme="danger"
    onclick={() => {
      result = '';
      error = '';
      open = true;
    }}
  >
    Terminate workflow
  </Button>
  {#if result}
    <p role="status" class="text-sm text-secondary">{result}</p>
  {/if}
</div>

<Modal
  id="guide-terminate-modal"
  bind:open
  bind:error
  {loading}
  confirmText="Terminate"
  cancelText="Cancel"
  confirmType="destructive"
  onCancelModal={hideModal}
  onConfirmModal={terminate}
>
  {#snippet titleSnippet()}
    <h3>Terminate workflow?</h3>
  {/snippet}
  {#snippet content()}
    <p>The workflow stops immediately and can't be resumed.</p>
    <Input
      id="guide-terminate-reason"
      class="mt-4"
      label="Reason (optional)"
      placeholder="Why is this workflow being terminated?"
      bind:value={reason}
    />
  {/snippet}
</Modal>
