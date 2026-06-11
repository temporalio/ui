<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    class?: string;
    title?: string;
    message: string;
    onRetry?: () => void;
    maxRetries?: number;
  }

  let {
    class: className = '',
    title = translate('common.error-occurred'),
    message,
    onRetry,
    maxRetries = 3,
  }: Props = $props();

  let retryCount = $state(0);
  let isRetrying = $state(false);

  const handleRetry = async () => {
    if (!onRetry || retryCount >= maxRetries) return;

    isRetrying = true;
    retryCount++;

    try {
      await onRetry();
    } finally {
      isRetrying = false;
    }
  };
</script>

{#key retryCount}
  <div class="space-y-6 {className}">
    <Alert intent="error" {title}>
      <div class="space-y-3">
        <p>{message}</p>

        {#if onRetry && retryCount < maxRetries}
          <div class="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              on:click={handleRetry}
              disabled={isRetrying}
            >
              <Icon name="retry" />
              {isRetrying
                ? translate('common.retrying')
                : translate('common.try-again')}
            </Button>
            {#if retryCount > 0}
              <span class="text-sm text-secondary">
                {translate('common.retry-attempt', {
                  current: retryCount + 1,
                  total: maxRetries + 1,
                })}
              </span>
            {/if}
          </div>
        {:else if onRetry && retryCount >= maxRetries}
          <div class="text-sm text-secondary">
            <p>
              {translate('common.max-retries-exceeded', {
                attempts: maxRetries + 1,
              })}
            </p>
            <p>{translate('common.retry-support-message')}</p>
          </div>
        {/if}
      </div>
    </Alert>
  </div>
{/key}
