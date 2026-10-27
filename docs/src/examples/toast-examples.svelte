<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { createIoToaster, Toaster } from '$lib/io-ark/toast';

  const toaster = createIoToaster({ placement: 'top-end' });

  const sendSignal = () =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => (Math.random() > 0.3 ? resolve() : reject()), 1500),
    );
</script>

<Toaster {toaster} />

<div class="flex flex-wrap gap-3">
  <Button
    colorScheme="secondary"
    onclick={() =>
      toaster.create({
        type: 'success',
        title: 'Workflow started',
        description: 'order-fulfillment-7f3a is running on orders-task-queue.',
        action: { label: 'View', onClick: () => {} },
      })}>Start workflow</Button
  >
  <Button
    colorScheme="secondary"
    onclick={() =>
      toaster.create({
        type: 'error',
        title: 'Could not terminate workflow',
        description:
          'You do not have permission to terminate workflows in payments-prod.',
        duration: 10000,
      })}>Terminate workflow</Button
  >
  <Button
    colorScheme="secondary"
    onclick={() =>
      toaster.promise(sendSignal, {
        loading: { title: 'Sending signal…', description: 'approve-order' },
        success: {
          title: 'Signal sent',
          description: 'approve-order was delivered.',
        },
        error: {
          title: 'Signal failed',
          description: 'The workflow is not running.',
        },
      })}>Send signal</Button
  >
  <Button
    colorScheme="secondary"
    onclick={() =>
      toaster.create({
        type: 'warning',
        title: 'Archival is disabled',
        description: 'Closed workflows will be deleted after 30 days.',
      })}>Show warning</Button
  >
</div>
