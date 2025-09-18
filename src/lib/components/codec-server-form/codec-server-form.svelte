<script lang="ts">
  import FormError from '$lib/components/form/form-error.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { CodecServerFormData } from './types';

  import CodecServerFormContent from './codec-server-form-content.svelte';
  import CodecServerFormSkeleton from './codec-server-form-skeleton.svelte';

  interface Props {
    class?: string;
    initialDataPromise: Promise<CodecServerFormData>;
    onSave: (data: CodecServerFormData) => Promise<void>;
    onSuccess?: (data: CodecServerFormData) => void;
    onCancel?: () => void;
    onRetry?: () => void;
  }

  let {
    class: className = '',
    initialDataPromise,
    onSave,
    onSuccess,
    onCancel,
    onRetry,
  }: Props = $props();
</script>

{#await initialDataPromise}
  <CodecServerFormSkeleton class={className} />
{:then initialData}
  <CodecServerFormContent
    class={className}
    {initialData}
    {onSave}
    {onSuccess}
    {onCancel}
  />
{:catch error}
  <FormError
    class={className}
    title={translate('codec-server.load-error-title')}
    message={error.message}
    {onRetry}
  />
{/await}
