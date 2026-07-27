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
  on:confirmModal={() => (open = false)}
  cancelText=""
  hideCancel
  large
  confirmText={translate('common.got-it')}
>
  <h2 slot="title">{translate('schedules.cron-format-modal-title')}</h2>
  <div slot="content" class="flex flex-col gap-2">
    <p class="text-secondary">
      {translate('schedules.cron-view-example-description')}
    </p>
    <pre class="w-full overflow-auto bg-code-block p-4 text-xs">{translate(
        'schedules.cron-format-diagram',
      )}</pre>
  </div>
</Modal>
