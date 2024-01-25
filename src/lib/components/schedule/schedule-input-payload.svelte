<script>
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  let payload = '';
</script>

<div class="flex flex-col gap-4">
  <label for="schedule-input">{translate('workflows.input')}</label>
  <CodeBlock
    id="schedule-input"
    class="max-h-80 overflow-y-scroll overscroll-contain"
    content={payload}
    editable
    copyable={false}
  />
  <span class="font-secondary text-xs font-light italic">
    {translate('workflows.signal-payload-input-label-hint')}
  </span>
</div>
