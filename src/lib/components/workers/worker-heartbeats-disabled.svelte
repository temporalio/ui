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
    class="my-6 flex w-full flex-col items-center justify-start gap-3"
    data-testid="worker-heartbeats-disabled"
    aria-live="polite"
  >
    <span
      class="flex h-10 w-10 items-center justify-center rounded-panel bg-information"
    >
      <Icon
        name="heartbeat"
        class="block h-6 w-6 text-information"
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
