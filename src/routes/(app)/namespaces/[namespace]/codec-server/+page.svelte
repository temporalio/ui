<script lang="ts">
  import { page } from '$app/state';

  import CodecServerForm from '$lib/components/codec-server-form/codec-server-form.svelte';
  import type { CodecServerFormData } from '$lib/components/codec-server-form/types';

  const namespace = $derived(page.params.namespace);

  async function fetchCodecServerConfig(): Promise<CodecServerFormData> {
    // TODO: Replace with actual service call when available
    // For now, return empty/default configuration
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      endpoint: '',
      passUserAccessToken: false,
      includeCrossOriginCredentials: false,
      customMessage: '',
      customLink: '',
    };
  }

  async function handleSave(data: CodecServerFormData): Promise<void> {
    // TODO: Implement when SDK team adds codec server endpoints
    console.log('Saving codec server configuration:', data);

    // For now, just simulate a save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, this would call a service like:
    // await saveCodecServerConfig(namespace, data);
  }

  function handleSuccess(data: CodecServerFormData) {
    console.log('Codec server configuration saved successfully:', data);
    // Add any other success handling here (toasts, navigation, etc.)
  }

  function handleCancel() {
    console.log('Codec server form cancelled');
    // Add any cancel handling here (navigation, confirmation, etc.)
  }

  function handleRetry() {
    // This will trigger a re-fetch of the initial data
    initialDataPromise = fetchCodecServerConfig();
  }

  let initialDataPromise = $state(fetchCodecServerConfig());
</script>

<svelte:head>
  <title>Codec Server Configuration</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Codec Server Configuration</h1>
    <p class="text-gray-600 mt-2">
      Configure codec server settings for the {namespace} namespace.
    </p>
  </div>

  <CodecServerForm
    {initialDataPromise}
    onSave={handleSave}
    onSuccess={handleSuccess}
    onCancel={handleCancel}
    onRetry={handleRetry}
  />
</div>
