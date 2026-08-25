<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconHeartbeat } from '$lib/io/icon';

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
      <IconHeartbeat
        class="block h-full w-full text-blue-200"
        height={20}
        width={20}
      />
    </span>
    <div class="text-center">
      <h5>
        {translate('workers.worker-heartbeats-disabled')}
      </h5>
      <p class="text-secondary">
        {translate('workers.worker-heartbeats-enablement')}
      </p>
    </div>
    <CodeBlock
      copyable
      {content}
      label={translate('workers.heartbeat-config')}
    />
  </div>
</Card>
