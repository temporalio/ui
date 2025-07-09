<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ApiError as ApiErrorType } from '$lib/utilities/api-error-handler';

  interface RetryConfig {
    maxRetries?: number;
    onRetry: () => Promise<unknown>;
  }

  interface Props {
    class?: string;
    error: ApiErrorType;
    retryConfig?: RetryConfig;
    title?: string;
  }

  let {
    class: className = '',
    error,
    retryConfig,
    title = translate('common.error-occurred'),
  }: Props = $props();

  let retryCount = $state(0);
  let isRetrying = $state(false);
  const maxRetries = $derived(retryConfig?.maxRetries ?? 3);

  const handleRetry = async () => {
    if (!retryConfig || retryCount >= maxRetries) return;

    isRetrying = true;
    retryCount++;

    try {
      await retryConfig.onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      isRetrying = false;
    }
  };
</script>

<div class="space-y-6 {className}">
  <Alert intent="error" {title}>
    <div class="space-y-3">
      <p>
        {error.userMessage || translate('common.unexpected-error')}
      </p>

      {#if error.isTemporary}
        <p class="text-sm text-orange-600">
          {translate('common.temporary-error')}
        </p>
      {/if}

      {#if error.isRetryable && retryConfig && retryCount < maxRetries}
        <div class="flex gap-2">
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
            <span class="text-gray-500 self-center text-sm">
              {translate('common.retry-attempt', {
                current: retryCount + 1,
                total: maxRetries + 1,
              })}
            </span>
          {/if}
        </div>
      {:else if retryConfig && retryCount >= maxRetries}
        <div class="text-gray-600 text-sm">
          <p>
            {translate('common.max-retries-exceeded', {
              attempts: maxRetries + 1,
            })}
          </p>
          <p>
            {translate('common.retry-support-message')}
          </p>
        </div>
      {/if}
    </div>
  </Alert>
</div>
