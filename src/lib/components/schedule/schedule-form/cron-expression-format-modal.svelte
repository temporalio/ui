<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
</script>

<Modal
  id="cron-expression-format-modal"
  bind:open
  onConfirmModal={() => (open = false)}
  cancelText=""
  hideCancel
  large
  confirmText={translate('common.got-it')}
>
  {#snippet titleSnippet()}
    <h2>{translate('schedules.cron-format-modal-title')}</h2>
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col gap-2">
      <p class="text-secondary">
        {translate('schedules.cron-view-example-description')}
      </p>
      <pre
        class="w-full overflow-auto bg-surface-code-block p-4 text-xs text-code-block">{translate(
          'schedules.cron-format-diagram',
        )}</pre>
    </div>
  {/snippet}
</Modal>
