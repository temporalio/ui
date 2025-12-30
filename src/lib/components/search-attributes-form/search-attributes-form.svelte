<script lang="ts">
  import FormError from '$lib/components/form/form-error.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { SearchAttributeDefinition } from './types';

  import SearchAttributesFormContent from './search-attributes-form-content.svelte';
  import SearchAttributesFormSkeleton from './search-attributes-form-skeleton.svelte';

  interface Props {
    class?: string;
    initialAttributesPromise: Promise<SearchAttributeDefinition[]>;
    onSave: (attributes: SearchAttributeDefinition[]) => Promise<void>;
    onSuccess?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
    onRetry?: () => void;
    getSupportedTypes: () => { label: string; value: string }[];
    hideTainted?: boolean;
    hideCancelButton?: boolean;
    disableTypeForExisting?: boolean;
  }

  let {
    class: className = '',
    initialAttributesPromise,
    onSave,
    onSuccess,
    onCancel,
    onRetry,
    getSupportedTypes,
    hideTainted = false,
    hideCancelButton = false,
    disableTypeForExisting = false,
  }: Props = $props();
</script>

{#await initialAttributesPromise}
  <SearchAttributesFormSkeleton class={className} />
{:then initialAttributes}
  <SearchAttributesFormContent
    class={className}
    {initialAttributes}
    {onSave}
    {onSuccess}
    {onCancel}
    {getSupportedTypes}
    {hideTainted}
    {hideCancelButton}
    {disableTypeForExisting}
  />
{:catch error}
  <FormError
    class={className}
    title={translate('search-attributes.load-error-title')}
    message={error.message}
    {onRetry}
  />
{/await}
