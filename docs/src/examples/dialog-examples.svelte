<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Dialog } from '$lib/io-ark/dialog';
  import { Field, FieldInput } from '$lib/io-ark/field';

  let terminateOpen = $state(false);
  let terminated = $state(false);

  let retentionOpen = $state(false);
  let retention = $state('30');
  let savedRetention = $state('30');
  const retentionError = $derived(
    /^\d+$/.test(retention) && +retention >= 1 && +retention <= 90
      ? ''
      : 'Enter a whole number of days between 1 and 90.',
  );

  let detailsOpen = $state(false);

  function terminate() {
    terminated = true;
    terminateOpen = false;
  }

  function saveRetention() {
    if (retentionError) return;
    savedRetention = retention;
    retentionOpen = false;
  }
</script>

<div class="flex flex-col gap-6">
  <section class="rounded-lg border border-primary p-6">
    <h3 class="mb-4 text-sm font-medium">Confirm a destructive action</h3>
    <div class="flex flex-wrap items-center gap-4">
      <Dialog
        bind:open={terminateOpen}
        role="alertdialog"
        size="sm"
        title="Terminate workflow?"
        description="order-fulfillment-7f3a will stop immediately. Pending activities will not run."
      >
        {#snippet trigger(props)}
          <Button {...props} colorScheme="danger" disabled={terminated}
            >Terminate</Button
          >
        {/snippet}
        {#snippet footer()}
          <Button colorScheme="tertiary" onclick={() => (terminateOpen = false)}
            >Cancel</Button
          >
          <Button colorScheme="danger" onclick={terminate}
            >Terminate workflow</Button
          >
        {/snippet}
      </Dialog>
      <p role="status" class="text-xs text-secondary">
        {terminated ? 'Workflow terminated' : 'Workflow running'}
      </p>
    </div>
  </section>

  <section class="rounded-lg border border-primary p-6">
    <h3 class="mb-4 text-sm font-medium">Edit settings in a form</h3>
    <div class="flex flex-wrap items-center gap-4">
      <Dialog
        bind:open={retentionOpen}
        title="Edit retention period"
        description="Closed workflow histories are kept for this many days in the payments-prod namespace."
        onOpenChange={(open) => open && (retention = savedRetention)}
      >
        {#snippet trigger(props)}
          <Button {...props} colorScheme="secondary">Edit retention</Button>
        {/snippet}
        <form
          id="retention-form"
          onsubmit={(event) => {
            event.preventDefault();
            saveRetention();
          }}
        >
          <Field
            label="Retention (days)"
            helperText="Between 1 and 90 days."
            error={retentionError}
            required
          >
            <FieldInput inputmode="numeric" bind:value={retention} />
          </Field>
        </form>
        {#snippet footer()}
          <Button colorScheme="tertiary" onclick={() => (retentionOpen = false)}
            >Cancel</Button
          >
          <Button
            type="submit"
            form="retention-form"
            disabled={!!retentionError}>Save</Button
          >
        {/snippet}
      </Dialog>
      <p role="status" class="text-xs text-secondary">
        Retention: {savedRetention} days
      </p>
    </div>
  </section>

  <section class="rounded-lg border border-primary p-6">
    <h3 class="mb-4 text-sm font-medium">Open from elsewhere</h3>
    <Button colorScheme="ghost" onclick={() => (detailsOpen = true)}
      >View task queue details</Button
    >
    <Dialog
      bind:open={detailsOpen}
      size="lg"
      title="orders-task-queue"
      description="Pollers that have contacted this task queue recently."
    >
      <dl class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
        <dt class="text-secondary">Workflow pollers</dt>
        <dd>4</dd>
        <dt class="text-secondary">Activity pollers</dt>
        <dd>12</dd>
        <dt class="text-secondary">Backlog</dt>
        <dd>0 tasks</dd>
      </dl>
    </Dialog>
  </section>
</div>
