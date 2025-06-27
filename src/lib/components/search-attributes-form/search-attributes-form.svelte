<script lang="ts">
  import ApiError from '$lib/components/api-error.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ApiError as ApiErrorType } from '$lib/utilities/api-error-handler';

  import type {
    SearchAttributeDefinition,
    SearchAttributesAdapter,
  } from './types';

  import { loadInitialAttributes } from './config.svelte';
  import SearchAttributesFormContent from './search-attributes-form-content.svelte';
  import SearchAttributesFormSkeleton from './search-attributes-form-skeleton.svelte';

  interface Props {
    class?: string;
    adapter: SearchAttributesAdapter;
    onSave?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
  }

  let {
    class: className = '',
    adapter,
    onSave = () => {},
    onCancel = () => {},
  }: Props = $props();

  let retryCount = $state(0);
  let maxRetries = 3;

  let attributesPromise = $derived(loadInitialAttributes(adapter));

  const retryLoad = () => {
    retryCount++;
    attributesPromise = loadInitialAttributes(adapter);
  };
</script>

{#await attributesPromise}
  <SearchAttributesFormSkeleton class={className} />
{:then initialAttributes}
  <SearchAttributesFormContent
    class={className}
    {adapter}
    {initialAttributes}
    {onSave}
    {onCancel}
  />
{:catch error}
  <ApiError
    class={className}
    error={error as ApiErrorType}
    {retryCount}
    {maxRetries}
    onRetry={retryLoad}
    title={translate('search-attributes.load-error-title')}
  />
{/await}
