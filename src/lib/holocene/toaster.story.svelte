<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import type { ToastVariant } from '$lib/types/holocene';
  
  import { toaster } from '../stores/toaster';
  
  import Button from './button.svelte';
  import Toaster from './toaster.svelte';

  export let Hst: HST;

  let variant: ToastVariant = 'primary';
  let duration = 3000;
  let message = 'This is the toast message';
</script>

<Hst.Story>
  <Toaster pop={toaster.pop} toasts={toaster.toasts} />
  <Button on:click={() => toaster.push({ variant, message, duration })}
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
  </svelte:fragment>
</Hst.Story>
