<svelte:options runes />

<script lang="ts" module>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';
  import { expect, within } from '@storybook/test';
  import type { ComponentProps } from 'svelte';

  import type { ComputeStatus } from '$lib/types/deployments';

  import ComputeBadge from './compute-badge.svelte';
  import ConnectionBadge from './connection-badge.svelte';

  export const meta = {
    title: 'Deployments/Compute Badge',
    component: ComputeBadge,
    args: {
      type: 'aws-lambda',
    },
    argTypes: {
      type: {
        control: 'select',
        options: ['aws-lambda', 'gcp-cloud-run', undefined],
      },
    },
  } satisfies Meta<ComponentProps<typeof ComputeBadge>>;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const connected = {
    providerValidation: {
      lastCheckTime: { seconds: nowSeconds - 3 * 3600, nanos: 0 },
    },
  } as unknown as ComputeStatus;
  const failed = {
    providerValidation: {
      lastCheckTime: { seconds: nowSeconds - 5 * 3600, nanos: 0 },
      errorMessage: 'No access role configured.',
    },
  } as unknown as ComputeStatus;
  const pending: ComputeStatus = { providerValidation: {} };
</script>

<Template let:args>
  <ComputeBadge {...args} />
</Template>

<Story name="All Scenarios">
  <div class="flex flex-col items-start gap-4 p-4">
    <div class="flex flex-col items-start gap-2">
      <p class="text-sm text-secondary">
        Current Version cell (pill + connection)
      </p>
      <ComputeBadge type="aws-lambda" computeStatus={connected} />
      <ComputeBadge type="aws-lambda" computeStatus={failed} />
      <ComputeBadge type="aws-lambda" computeStatus={pending} />
      <ComputeBadge type="gcp-cloud-run" computeStatus={connected} />
      <ComputeBadge type="gcp-cloud-run" computeStatus={failed} />
      <ComputeBadge type="gcp-cloud-run" computeStatus={pending} />
    </div>
    <div class="flex flex-col items-start gap-2">
      <p class="text-sm text-secondary">Compute only (no connection)</p>
      <ComputeBadge type="aws-lambda" />
      <ComputeBadge type="gcp-cloud-run" />
    </div>
    <div class="flex flex-col items-start gap-2">
      <p class="text-sm text-secondary">
        Connection column (details, word only)
      </p>
      <ConnectionBadge computeStatus={connected} />
      <ConnectionBadge computeStatus={failed} />
      <ConnectionBadge computeStatus={pending} />
    </div>
  </div>
</Story>

<Story
  name="Lambda Connected"
  args={{ type: 'aws-lambda', computeStatus: connected }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Lambda')).toBeInTheDocument();
    await expect(canvas.getByText('Connected')).toBeInTheDocument();
  }}
/>
<Story
  name="Lambda Failed"
  args={{ type: 'aws-lambda', computeStatus: failed }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Lambda')).toBeInTheDocument();
    await expect(canvas.getByText('Failed')).toBeInTheDocument();
  }}
/>
<Story
  name="Lambda Pending"
  args={{ type: 'aws-lambda', computeStatus: pending }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Lambda')).toBeInTheDocument();
    await expect(canvas.getByText('Pending')).toBeInTheDocument();
  }}
/>
<Story
  name="Cloud Run Pending"
  args={{ type: 'gcp-cloud-run', computeStatus: pending }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Cloud Run')).toBeInTheDocument();
    await expect(canvas.getByText('Pending')).toBeInTheDocument();
  }}
/>
<Story
  name="Compute Only"
  args={{ type: 'aws-lambda' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Lambda')).toBeInTheDocument();
    await expect(canvas.queryByText('Connected')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Pending')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Failed')).not.toBeInTheDocument();
  }}
/>
