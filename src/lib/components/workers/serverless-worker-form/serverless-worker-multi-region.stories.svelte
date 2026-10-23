<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import {
    type ComputeProviderConfig,
    configuredRegions,
    deployRegionsFor,
  } from '$lib/utilities/compute-provider-config';

  import { computeRegionsFor } from './multi-region';

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

  const EAST = { regionId: 'aws-us-east-1', label: 'us-east-1' };
  const WEST = { regionId: 'aws-us-west-2', label: 'us-west-2' };

  /**
   * The one prop a host passes to the worker deployment pages. Temporal Cloud
   * builds it per Namespace: the Namespace's cloud decides the providers, and
   * its regions and replicas decide the regions.
   */
  const providerConfigFor = (namespace: Topology): ComputeProviderConfig =>
    namespace === 'multi'
      ? {
          providers: [{ value: 'lambda' }, { value: 'agentcore' }],
          regions: [
            { ...EAST, role: 'primary' },
            { ...WEST, role: 'replica' },
          ],
        }
      : {
          providers: [
            { value: 'lambda' },
            { value: 'cloud-run', deployRegions: ['us-central1', 'us-east1'] },
          ],
          regions: [{ ...EAST, role: 'primary' }],
        };

  /** What each page derives from the config before it renders a form. */
  const formPropsFor = (namespace: Topology) => {
    const config = providerConfigFor(namespace);
    return {
      computeProviders: config.providers,
      gcpRegions: deployRegionsFor(config, 'cloud-run'),
      regions: computeRegionsFor(configuredRegions(config), 'lambda'),
    };
  };

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
          {...formPropsFor(args.namespace)}
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
          {...formPropsFor(args.namespace)}
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
          {...formPropsFor(args.namespace)}
        />
      </div>
    {/key}
  {/snippet}
</Story>
