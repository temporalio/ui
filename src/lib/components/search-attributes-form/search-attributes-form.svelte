<script lang="ts">
  import ApiError from '$lib/components/api-error.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ApiError as ApiErrorType } from '$lib/utilities/api-error-handler';

  import type { SearchAttributesAdapter } from './types';

  import { loadInitialAttributes } from './config.svelte';
  import SearchAttributesFormContent from './search-attributes-form-content.svelte';
  import SearchAttributesFormSkeleton from './search-attributes-form-skeleton.svelte';

  interface Props {
    class?: string;
    adapter: SearchAttributesAdapter;
  }

  let { class: className = '', adapter }: Props = $props();

  let attributesPromise = $derived(loadInitialAttributes(adapter));

  const retryLoad = async () => {
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
  />
{:catch error}
  <ApiError
    class={className}
    error={error as ApiErrorType}
    retryConfig={{ retryFn: retryLoad }}
    title={translate('search-attributes.load-error-title')}
  />
{/await}
