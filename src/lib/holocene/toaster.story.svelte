<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import Button from './button.svelte';

  import Toaster, { toaster, type ToastVariant } from './toaster.svelte';

  export let Hst: HST;

  let variant: ToastVariant = 'primary';
  let duration = 3000;
  let message = 'This is the toast message';
  let xPosition: 'right' | 'left' = 'right';
  let yPosition: 'bottom' | 'top' = 'top';
</script>

<Hst.Story>
  <Toaster pop={toaster.pop} toasts={toaster.toasts} />
  <Button
    on:click={() =>
      toaster.push({ variant, message, duration, xPosition, yPosition })}
    >Trigger Toast</Button
  >

  <svelte:fragment slot="controls">
    <Hst.Text title="Message: " bind:value={message} />
    <Hst.Number title="Duration: " bind:value={duration} />
    <Hst.Select
      title="Variant: "
      bind:value={variant}
      options={['info', 'error', 'success', 'warning', 'primary']}
    />
    <Hst.Select
      title="X Position: "
      bind:value={xPosition}
      options={['left', 'right']}
    />
    <Hst.Select
      title="Y Position: "
      bind:value={yPosition}
      options={['top', 'bottom']}
    />
  </svelte:fragment>
</Hst.Story>
