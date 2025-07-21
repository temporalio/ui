<script lang="ts" context="module">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import type { CodecServerAdapter, CodecServerFormData } from './types';

  import CodecServerForm from './codec-server-form.svelte';

  const defaultAdapter: CodecServerAdapter = {
    async fetchCodecServer(): Promise<CodecServerFormData> {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        endpoint: '',
        passUserAccessToken: false,
        includeCrossOriginCredentials: false,
        customMessage: '',
        customLink: '',
      };
    },

    async saveCodecServer(data: CodecServerFormData): Promise<void> {
      action('saveCodecServer')(data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },

    onSuccess: async (data: CodecServerFormData) => {
      action('onSuccess')(data);
    },

    onCancel: () => {
      action('onCancel')();
    },
  };

  const prefilledAdapter: CodecServerAdapter = {
    async fetchCodecServer(): Promise<CodecServerFormData> {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        endpoint:
          'https://docs.temporal.io/production-deployment/data-encryption#set-your-codec-server',
        passUserAccessToken: true,
        includeCrossOriginCredentials: false,
        customMessage: 'Custom error message for codec server failures',
        customLink: 'https://example.com/help',
      };
    },

    async saveCodecServer(data: CodecServerFormData): Promise<void> {
      action('saveCodecServer')(data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },

    onSuccess: async (data: CodecServerFormData) => {
      action('onSuccess')(data);
    },

    onCancel: () => {
      action('onCancel')();
    },
  };

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

<Story name="Default" args={{ adapter: defaultAdapter }} />

<Story name="Prefilled" args={{ adapter: prefilledAdapter }} />
