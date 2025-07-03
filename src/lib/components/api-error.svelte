<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { ApiError as ApiErrorType } from '$lib/utilities/api-error-handler';

  interface RetryConfig {
    maxRetries?: number;
    retryFn: () => Promise<unknown>;
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
    title = 'An Error Occurred',
  }: Props = $props();

  let retryCount = $state(0);
  let isRetrying = $state(false);
  const maxRetries = retryConfig?.maxRetries ?? 3;

  const handleRetry = async () => {
    if (!retryConfig || retryCount >= maxRetries) return;

    isRetrying = true;
    retryCount++;

    try {
      await retryConfig.retryFn();
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
        {error.userMessage || 'An unexpected error occurred.'}
      </p>

      {#if error.isTemporary}
        <p class="text-sm text-orange-600">
          This appears to be a temporary issue. Please try again in a few
          moments.
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
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
          {#if retryCount > 0}
            <span class="text-gray-500 self-center text-sm">
              Attempt {retryCount + 1} of {maxRetries + 1}
            </span>
          {/if}
        </div>
      {:else if retryConfig && retryCount >= maxRetries}
        <div class="text-gray-600 text-sm">
          <p>Unable to complete operation after {maxRetries + 1} attempts.</p>
          <p>
            Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      {/if}
    </div>
  </Alert>
</div>
