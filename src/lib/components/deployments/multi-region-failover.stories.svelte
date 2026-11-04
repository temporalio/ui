<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Modal from '$lib/holocene/modal.svelte';

  /**
   * Mock of the Temporal Cloud namespace page (cloud-ui `mrn-status.svelte`
   * and `replica-health-provider.svelte`). Copy is inline because it ships in
   * cloud-ui, not here.
   */

  const { Story } = defineMeta({
    title: 'Workers/Multi-Region/Failover Warning',
  });

  const namespace = 'orders.a1b2c';
  const shortNamespace = namespace.replace(/\.[a-z0-9]{5}$/i, '');

  const target = 'us-west-2';

  const primary = 'us-east-1';

  /** Worker Deployments Temporal runs, and the Regions each one covers. */
  const serverlessDeployments = [
    { name: 'orders-worker', regions: [primary, target] },
    { name: 'notifications-worker', regions: [primary] },
    { name: 'reports-worker', regions: [primary] },
  ];

  /** Worker Deployments the customer runs on their own infrastructure. */
  const yourDeployments = ['billing-worker', 'search-indexer'];

  /** Serverless Worker Deployments with nothing to run in the target Region. */
  const uncovered = serverlessDeployments
    .filter(({ regions }) => !regions.includes(target))
    .map(({ name }) => name);
</script>

{#snippet failoverReadinessAlert()}
  <Alert
    intent="warning"
    title={`${uncovered.length} Serverless Worker Deployments can't fail over to ${target}`}
  >
    <div class="flex flex-col items-start gap-3">
      <p>
        If <span class="font-medium">{shortNamespace}</span> fails over, Tasks for
        these Serverless Worker Deployments queue until a Worker polls, and may time
        out.
      </p>
      {@render uncoveredList()}
      <Button variant="tertiary" size="sm" href="#">
        View Worker Deployments
      </Button>
    </div>
  </Alert>
{/snippet}

{#snippet uncoveredList()}
  <ul class="list-disc space-y-1 pl-5">
    {#each uncovered as deployment (deployment)}
      <li><Link href="#">{deployment}</Link></li>
    {/each}
  </ul>
{/snippet}

<!--
  When: the Namespace is multi-region and at least one Serverless Worker
  Deployment's Current or Ramping Version has nothing to run in a replica
  Region (no scaling group with that regionId, and no catch-all group). Hidden
  once every such Version covers every Region. Versions that are Draining or
  Drained do not count.
  Where: the top of the namespace overview page in cloud-ui, so it is seen
  before someone reaches the Trigger Failover action. The failover modal
  repeats the list at the moment of failover.
-->
<Story name="Failover Readiness Alert">
  {#snippet template()}
    <div class="max-w-[62rem] p-4">
      {@render failoverReadinessAlert()}
      <div class="mt-3 flex flex-col gap-1 text-xs text-secondary">
        <p>
          When: multi-region Namespace, and a Serverless Worker Deployment has
          nothing to run in a replica Region.
        </p>
        <p>Where: top of the namespace overview.</p>
      </div>
    </div>
  {/snippet}
</Story>

<!--
  Placement: the namespace overview main column (cloud-ui
  src/lib/components/namespace/overview/main-card/index.svelte), above the
  Usage card, only when the Namespace has Worker Deployments. Splits the Namespace's Worker Deployments into Serverless ones
  that Temporal runs and ones the customer runs, and shows which Regions each
  Serverless Worker Deployment can run in, so failover gaps are visible.
-->
<Story name="Namespace Overview Card">
  {#snippet template()}
    <div class="flex max-w-[45rem] flex-col gap-3 p-4">
      <Card class="p-5">
        <h2 class="text-base font-medium">Worker Deployments</h2>
        <p class="text-sm text-secondary">Who runs each Worker Deployment.</p>

        <h3 class="mt-4 text-sm font-medium">Serverless</h3>
        <p class="text-xs text-secondary">Temporal runs these Workers</p>
        <ul class="mt-2 flex flex-col divide-y divide-primary">
          {#each serverlessDeployments as deployment (deployment.name)}
            {@const missing = !deployment.regions.includes(target)}
            <li class="flex items-center justify-between gap-4 py-2">
              <Link href="#" class="text-sm">{deployment.name}</Link>
              {#if missing}
                <span class="text-sm text-warning">
                  Not configured in {target}
                </span>
              {:else}
                <span class="text-sm text-secondary">
                  {deployment.regions.join(', ')}
                </span>
              {/if}
            </li>
          {/each}
        </ul>

        <h3 class="mt-4 text-sm font-medium">Yours</h3>
        <p class="text-xs text-secondary">You run these Workers</p>
        <ul class="mt-2 flex flex-col divide-y divide-primary">
          {#each yourDeployments as deployment (deployment)}
            <li class="py-2">
              <Link href="#" class="text-sm">{deployment}</Link>
            </li>
          {/each}
        </ul>

        <div class="pt-4">
          <Button variant="tertiary" size="sm" href="#">
            View Worker Deployments
          </Button>
        </div>
      </Card>
      <div class="flex flex-col gap-1 text-xs text-secondary">
        <p>Where: namespace overview main column, above Usage.</p>
        <p>When: the Namespace has Worker Deployments.</p>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Failover Modal">
  {#snippet template()}
    <Modal
      id="trigger-modal"
      open
      cancelText="Cancel"
      confirmText="Failover"
      onCancelModal={() => {}}
      onConfirmModal={() => {}}
    >
      {#snippet titleSnippet()}
        <div>Trigger Failover</div>
      {/snippet}
      {#snippet content()}
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <p>
              Are you sure you want to failover <strong>{namespace}</strong>
              from <strong>AWS us-east-1</strong> to
              <strong>AWS {target}</strong>?
            </p>
            <p>
              Workflow processing and task dispatching will now happen in
              <strong>AWS {target}</strong> region.
            </p>
          </div>
          {@render failoverReadinessAlert()}
        </div>
      {/snippet}
    </Modal>
  {/snippet}
</Story>
