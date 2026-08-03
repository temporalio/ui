<script lang="ts" module>
  import { Story } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';
  import { expect, within } from '@storybook/test';
  import type { ComponentProps } from 'svelte';

  import ComputeProviderPicker from './compute-provider-picker.svelte';

  export const meta = {
    title: 'Workers/Compute Provider Picker',
    component: ComputeProviderPicker,
  } satisfies Meta<ComponentProps<typeof ComputeProviderPicker>>;
</script>

<Story name="Default (self-hosted)">
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker provider="lambda" />
  </div>
</Story>

<Story
  name="AWS namespace (grey out incompatible)"
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
