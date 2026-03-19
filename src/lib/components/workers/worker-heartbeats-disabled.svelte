<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';

  const content = `frontend.workerHeartbeatsEnabled:
  - value: true`;
</script>

<Alert
  title={translate('workers.worker-heartbeats-disabled')}
  intent="info"
  class="max-w-4xl"
/>
<div class="flex max-w-4xl flex-col gap-2">
  <p>{translate('workers.worker-heartbeats-enablement')}</p>
  <CodeBlock copyable {content} />
</div>
