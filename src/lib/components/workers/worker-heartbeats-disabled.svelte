<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  const content = `frontend.workerHeartbeatsEnabled:
  - value: true`;
</script>

<Card>
  <div
    class="my-12 flex w-full flex-col items-center justify-start gap-4"
    data-testid="worker-heartbeats-disabled"
    aria-live="polite"
  >
    <span class="flex h-20 w-20 items-center justify-center rounded-full">
      <Icon name="workers" class="block h-full w-full text-blue-200" />
    </span>
    <div class="text-center">
      <h5>
        {translate('workers.worker-heartbeats-disabled')}
      </h5>
      <p class="text-secondary">
        {translate('workers.worker-heartbeats-enablement')}
      </p>
    </div>
    <CodeBlock copyable {content} />
  </div>
</Card>
