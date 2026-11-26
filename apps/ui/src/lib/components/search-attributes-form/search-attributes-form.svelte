<script lang="ts">
  import type { Snippet } from 'svelte';

  import FormError from '$lib/components/form/form-error.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { SearchAttributeDefinition } from './types';

  import SearchAttributesFormContent from './search-attributes-form-content.svelte';
  import SearchAttributesFormSkeleton from './search-attributes-form-skeleton.svelte';

  interface Props {
    class?: string;
    description?: Snippet;
    initialAttributesPromise: Promise<SearchAttributeDefinition[]>;
    onSave: (attributes: SearchAttributeDefinition[]) => Promise<void>;
    onSuccess?: (attributes: SearchAttributeDefinition[]) => void;
    onCancel?: () => void;
    onRetry?: () => void;
    hideTainted?: boolean;
    disableTypeForExisting?: boolean;
    isCloud?: boolean;
  }

  let {
    class: className = '',
    description,
    initialAttributesPromise,
    onSave,
    onSuccess,
    onCancel,
    onRetry,
    hideTainted = false,
    disableTypeForExisting = false,
    isCloud = false,
  }: Props = $props();
</script>

{#await initialAttributesPromise}
  <SearchAttributesFormSkeleton class={className} />
{:then initialAttributes}
  <SearchAttributesFormContent
    class={className}
    {description}
    {initialAttributes}
    {onSave}
    {onSuccess}
    {onCancel}
    {hideTainted}
    {disableTypeForExisting}
    {isCloud}
  />
{:catch error}
  <FormError
    class={className}
    title={translate('search-attributes.load-error-title')}
    message={error.message}
    {onRetry}
  />
{/await}
