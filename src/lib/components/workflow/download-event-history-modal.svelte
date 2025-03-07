<script lang="ts">
  import { page } from '$app/stores';

  import Modal from '$lib/holocene/modal.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { downloadEventHistorySetting } from '$lib/stores/events';
  import { exportHistory } from '$lib/utilities/export-history';

  export let open = false;
  export let namespace: string;
  export let workflowId: string;
  export let runId: string;

  const onDownloadClick = () => {
    open = false;
    exportHistory({
      namespace,
      workflowId,
      runId,
      settings: $page.data.settings,
      decodeSetting: $downloadEventHistorySetting,
    });
  };
</script>

<Modal
  id="download-history"
  large
  bind:open
  confirmType="primary"
  confirmText={translate('common.download')}
  cancelText={translate('common.cancel')}
  on:confirmModal={() => onDownloadClick()}
  on:cancelModal={() => (open = false)}
>
  <h3 slot="title">
    {translate('common.download-event-history-json')}
  </h3>
  <div slot="content" class="flex flex-col gap-4">
    <RadioGroup
      group={downloadEventHistorySetting}
      name="decode-setting"
      class="h-auto overflow-auto"
    >
      <RadioInput
        id="use-encoded-setting"
        data-testid="use-encoded-setting-input"
        value="encoded"
        label={translate('events.encoded')}
      />
      <RadioInput
        id="use-decoded-setting"
        data-testid="use-decoded-setting-input"
        value="decoded"
        label={translate('events.decoded')}
        description={translate('events.decoded-description')}
      />
      <RadioInput
        id="use-readable-setting"
        data-testid="use-readable-setting-input"
        value="readable"
        label={translate('events.readable')}
        description={translate('events.readable-description')}
      />
    </RadioGroup>
  </div>
</Modal>
