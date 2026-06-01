<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
</script>

<Modal
  id="cron-expression-format-modal"
  bind:open
  on:confirmModal={() => (open = false)}
  cancelText=""
  hideCancel
  large
  confirmText="Got It"
>
  <span slot="title">Cron expression format</span>
  <div slot="content" class="flex flex-col gap-2">
    <p class="text-secondary">
      Temporal Workflow Schedule Cron strings follow this format:
    </p>
    <pre class="w-full overflow-auto bg-code-black p-4 text-xs">
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *</pre>
  </div>
</Modal>
