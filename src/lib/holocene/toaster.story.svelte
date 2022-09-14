<script lang="ts">
  import Button from './button.svelte';

  import Toaster, { toaster, type ToastVariant } from './toaster.svelte';

  export let Hst;

  let variant: ToastVariant = 'primary';
  let duration = 1000;
  let message = 'This is the toast message';
</script>

<Hst.Story>
  <Toaster pop={toaster.pop} toasts={toaster.toasts} />
  <Button on:click={() => toaster.push({ variant, message, duration })}
    >Trigger Toast</Button
  >

  <svelte:fragment slot="controls">
    <Hst.Text title="Message: " bind:value={message} />
    <Hst.Number title="Duration: " bind:value={duration} interval={100} />
    <Hst.Select
      title="Variant: "
      bind:value={variant}
      options={['info', 'error', 'success', 'warning', 'primary']}
    />
  </svelte:fragment>
</Hst.Story>
