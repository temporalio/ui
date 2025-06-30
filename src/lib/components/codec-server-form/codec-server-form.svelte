<script lang="ts">
  import ApiError from '$lib/components/api-error.svelte';
  import type { ApiError as ApiErrorType } from '$lib/utilities/api-error-handler';

  import type { CodecServerAdapter } from './types';

  import CodecServerFormContent from './codec-server-form-content.svelte';
  import CodecServerFormSkeleton from './codec-server-form-skeleton.svelte';
  import { loadInitialData } from './config.svelte';

  interface Props {
    class?: string;
    adapter: CodecServerAdapter;
  }

  let { class: className = '', adapter }: Props = $props();

  let retryCount = $state(0);
  let maxRetries = 3;

  let dataPromise = $derived(loadInitialData(adapter));

  const retryLoad = () => {
    retryCount++;
    dataPromise = loadInitialData(adapter);
  };
</script>

{#await dataPromise}
  <CodecServerFormSkeleton class={className} />
{:then initialData}
  <CodecServerFormContent class={className} {adapter} {initialData} />
{:catch error}
  <ApiError
    class={className}
    error={error as ApiErrorType}
    {retryCount}
    {maxRetries}
    onRetry={retryLoad}
    title="Failed to load codec server settings"
  />
{/await}
