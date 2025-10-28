<script lang="ts" context="module">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import type { CodecServerFormData } from './types';

  import CodecServerForm from './codec-server-form.svelte';

  async function fetchDefaultData(): Promise<CodecServerFormData> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      endpoint: '',
      passUserAccessToken: false,
      includeCrossOriginCredentials: false,
      customMessage: '',
      customLink: '',
    };
  }

  async function fetchPrefilledData(): Promise<CodecServerFormData> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      endpoint:
        'https://docs.temporal.io/production-deployment/data-encryption#set-your-codec-server',
      passUserAccessToken: true,
      includeCrossOriginCredentials: false,
      customMessage: 'Custom error message for codec server failures',
      customLink: 'https://example.com/help',
    };
  }

  // Mock data fetcher with error
  async function fetchDataWithError(): Promise<CodecServerFormData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Simulate a network error
    throw new Error(
      'Failed to load codec server configuration: Internal Server Error',
    );
  }

  async function handleSave(data: CodecServerFormData): Promise<void> {
    action('onSave')(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  function handleSuccess(data: CodecServerFormData) {
    action('onSuccess')(data);
  }

  function handleCancel() {
    action('onCancel')();
  }

  export const meta = {
    title: 'Forms/Codec Server Form',
    component: CodecServerForm,
    parameters: {
      layout: 'padded',
    },
  } satisfies Meta<CodecServerForm>;
</script>

<Template let:args>
  <div class="space-y-6">
    <h1 class="text-sm font-medium">Codec Server for checkout-prod.a2dd6</h1>
    <CodecServerForm {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    initialDataPromise: fetchDefaultData(),
    onSave: handleSave,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
  }}
/>

<Story
  name="Prefilled"
  args={{
    initialDataPromise: fetchPrefilledData(),
    onSave: handleSave,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
  }}
/>

<Story
  name="Error State"
  args={{
    initialDataPromise: fetchDataWithError(),
    onSave: handleSave,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    onRetry: action('onRetry'),
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Form that encounters a server error when loading. Shows error handling with retry functionality.',
      },
    },
  }}
/>
