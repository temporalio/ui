<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import type { ComputeRegion } from './multi-region';
  import type { ComputeProviderOption } from './shared';

  import CreateVersionForm from './create-version-form.svelte';
  import EditVersionForm from './edit-version-form.svelte';
  import ServerlessWorkerCreateForm from './serverless-worker-create-form.svelte';

  type Topology = 'single' | 'multi';
  type StoryArgs = {
    namespace: Topology;
  };

  const { Story } = defineMeta({
    title: 'Workers/Multi-Region/Forms',
    args: { namespace: 'multi' },
    argTypes: {
      namespace: {
        name: 'Namespace',
        control: {
          type: 'inline-radio',
          labels: { single: 'Single region', multi: 'Multi-region' },
        },
        options: ['single', 'multi'],
      },
    },
  });

  const multiRegions: ComputeRegion[] = [
    {
      id: 'aws-us-east-1',
      role: 'primary',
      label: 'us-east-1',
      provider: 'lambda',
    },
    {
      id: 'aws-us-west-2',
      role: 'replica',
      label: 'us-west-2',
      provider: 'lambda',
    },
  ];

  const regionsFor = (namespace: Topology): ComputeRegion[] =>
    namespace === 'multi' ? multiRegions : multiRegions.slice(0, 1);

  /** Temporal Cloud offers only the providers matching the Namespace's cloud. */
  const providersFor = (namespace: Topology): ComputeProviderOption[] =>
    namespace === 'multi'
      ? [{ value: 'lambda' }, { value: 'agentcore' }]
      : [{ value: 'lambda' }, { value: 'cloud-run' }];

  const namespace = 'orders.a1b2c';

  const noop = async () => {};

  const editInitialData = {
    provider: 'lambda' as const,
    lambdaArn: 'arn:aws:lambda:us-east-1:123456789012:function:orders-worker',
    iamRoleArn:
      'arn:aws:iam::123456789012:role/Temporal-Cloud-Serverless-Worker',
    roleExternalId: 'tmprl-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  };
</script>

<Story name="Create Deployment">
  {#snippet template(args: StoryArgs)}
    {#key `${args.namespace}`}
      <div class="p-4">
        <ServerlessWorkerCreateForm
          onSubmit={noop}
          onSuccess={() => {}}
          cancelHref="#"
          {namespace}
          computeProviders={providersFor(args.namespace)}
          regions={regionsFor(args.namespace)}
        />
      </div>
    {/key}
  {/snippet}
</Story>

<Story name="Create Version">
  {#snippet template(args: StoryArgs)}
    {#key `${args.namespace}`}
      <div class="p-4">
        <CreateVersionForm
          deploymentName="orders-worker"
          onSubmit={noop}
          cancelHref="#"
          {namespace}
          computeProviders={providersFor(args.namespace)}
          regions={regionsFor(args.namespace)}
        />
      </div>
    {/key}
  {/snippet}
</Story>

<Story name="Edit Version">
  {#snippet template(args: StoryArgs)}
    {#key args.namespace}
      <div class="p-4">
        <EditVersionForm
          deploymentName="orders-worker"
          buildId="2.4.0"
          initialData={editInitialData}
          onSubmit={noop}
          onDelete={() => {}}
          cancelHref="#"
          {namespace}
          computeProviders={providersFor(args.namespace)}
          regions={regionsFor(args.namespace)}
        />
      </div>
    {/key}
  {/snippet}
</Story>
