<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import ComputeProviderPicker from './compute-provider-picker.svelte';

  const { Story } = defineMeta({
    title: 'Workers/Compute Provider Picker',
    component: ComputeProviderPicker,
  });
</script>

<Story name="Default (self-hosted)" asChild>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker provider="lambda" />
  </div>
</Story>

<Story
  name="AWS namespace (grey out incompatible)"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Not supported in AWS namespaces'),
    ).toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="lambda"
      providers={[
        { value: 'lambda' },
        {
          value: 'cloud-run',
          disabled: true,
          disabledReason: 'Not supported in AWS namespaces',
        },
      ]}
    />
  </div>
</Story>

<Story
  name="GCP namespace (grey out incompatible)"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Not supported in GCP namespaces'),
    ).toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="cloud-run"
      providers={[
        {
          value: 'lambda',
          disabled: true,
          disabledReason: 'Not supported in GCP namespaces',
        },
        { value: 'cloud-run' },
      ]}
    />
  </div>
</Story>

<Story
  name="AWS namespace (hide incompatible)"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AWS Lambda')).toBeInTheDocument();
    await expect(
      canvas.queryByText('Google Cloud Run'),
    ).not.toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="lambda"
      providers={[{ value: 'lambda' }]}
    />
  </div>
</Story>

<Story
  name="Both enabled (cross-cloud)"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Public Preview')).toBeInTheDocument();
    await expect(canvas.getByText('Pre-release')).toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="lambda"
      providers={[{ value: 'lambda' }, { value: 'cloud-run' }]}
    />
  </div>
</Story>

<Story
  name="Release stage overridden by caller"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Public Preview')).not.toBeInTheDocument();
    await expect(canvas.getByText('Pre-release')).toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="lambda"
      providers={[
        { value: 'lambda', releaseStage: 'generally-available' },
        { value: 'cloud-run', releaseStage: 'pre-release' },
      ]}
    />
  </div>
</Story>

<Story
  name="AWS namespace (Lambda and AgentCore)"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AWS Lambda')).toBeInTheDocument();
    await expect(
      canvas.getByText('Amazon Bedrock AgentCore'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Public Preview')).toBeInTheDocument();
    await expect(canvas.getByText('Pre-release')).toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="agentcore"
      providers={[{ value: 'lambda' }, { value: 'agentcore' }]}
    />
  </div>
</Story>

<Story
  name="Self-hosted (every provider selectable)"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AWS Lambda')).toBeInTheDocument();
    await expect(
      canvas.getByText('Amazon Bedrock AgentCore'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Google Cloud Run')).toBeInTheDocument();
    await expect(canvas.queryByText('Coming Soon')).not.toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker provider="agentcore" />
  </div>
</Story>

<Story
  name="Locked to the provider a Version uses"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Amazon Bedrock AgentCore'),
    ).toBeInTheDocument();
    await expect(canvas.queryByText('AWS Lambda')).not.toBeInTheDocument();
  }}
>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="agentcore"
      providers={[
        { value: 'lambda', hidden: true },
        { value: 'agentcore' },
        { value: 'cloud-run', hidden: true },
      ]}
    />
  </div>
</Story>
