import { defineScenario } from '../../definition';

const PRIMARY = 'aws-us-east-1';
const REPLICA = 'aws-us-west-2';

export const definition = defineScenario({
  name: 'multi-region-compute',
  title: 'Compute per Namespace region for serverless Workers',
  summary:
    'Saves a Worker Deployment Version with one scaling group per region when high availability is on, and shows which regions it covers. The server comes from the branch that maps region_ids into the worker controller, with a demo-only patch that gives the server a host region. The dev server has one cluster, so the UI takes the Namespace regions from VITE_NAMESPACE_REGIONS instead of the replication config.',
  server: {
    // region_ids reaches the server through two unreleased changes: the server
    // branch that maps the field, and the worker controller that honours it.
    source: 'workspace',
    requires: {
      serverRef: 'mani/ha-serverless-api',
      serverModules: {
        // The api-go build generated from the region_ids proto change.
        'go.temporal.io/api': 'v1.63.7-0.20261008215930-cdda301d97b4',
      },
      pinnedModules: {
        // The worker controller with region_ids and a host region; the server
        // branch does not compile without it. Pinned, not a floor: the CLI
        // requires a release that sorts above this commit's pseudo-version.
        'go.temporal.io/auto-scaled-workers':
          'v0.0.0-20261009204226-a34447bb557c',
        // The server branch moved to SDK v1.49.0, which removed a field the
        // CLI still sets (StartActivityOptions.Details). v1.48.0 suits both.
        'go.temporal.io/sdk': 'v1.48.0',
      },
      commands: ['aws', 'temporal'],
    },
    // The open-source server supplies no host region, and without one the
    // worker controller rejects every group that sets region_ids.
    patches: [
      'utilities/demo/scenarios/multi-region-compute/host-region.patch',
    ],
    env: { TEMPORAL_DEMO_HOST_REGION: PRIMARY },
    // Distinct ports on purpose. Every stage stands down when something already
    // listens, and a stock server or UI there would make this run prove nothing.
    port: 7633,
    uiPort: 8633,
    httpPort: 7643,
    dynamicConfig: {
      'workercontroller.enabled': true,
      'workercontroller.compute_providers.enabled': ['aws-lambda'],
      // Ambient AWS credentials instead of an assumed role. Local only.
      'workercontroller.compute_providers.aws.require_role_and_external_id': false,
    },
  },
  ui: {
    apiPort: 8681,
    webPort: 3600,
    // The reused ui-server must carry an api build that knows region_ids.
    rebuildUiServer: true,
    env: {
      VITE_NAMESPACE_REGIONS: `${PRIMARY}=us-east-1:primary,${REPLICA}=us-west-2:replica`,
    },
  },
  // The catalog cannot exercise this feature. Its worker is unversioned, so it
  // registers no Worker Deployment, and a compute config is attached through
  // the update RPC, not by a Worker describing itself.
  worker: { enabled: false },
  examples: [],
  preview: {
    notes: [
      `Prerequisite: a Lambda function in each region (${PRIMARY} and ${REPLICA}), an IAM role this shell's AWS credentials can assume, and those credentials in this shell. Creating a Version validates every group against AWS, and nothing is saved if one fails, so a made-up ARN or role stops the save at the provider. The serverless-worker-aws skill sets these up.`,
      `Open Workers, then Create Serverless Worker. The Compute section shows the ${PRIMARY} block and a High availability switch, off. Off saves one group that no region scopes, exactly as a single-region Version does.`,
      `Turn High availability on. The replica card takes the Namespace's replica, ${REPLICA}, with no region to choose. It suggests its Lambda ARN from the primary's by swapping the region, and takes the primary's Access and Scaling until Customize is pressed. Point both at one region to see the warning that an outage there stops both.`,
      "Leave a required field empty in one region and submit. The error shows in that region's block, and nothing is saved. A Lambda that AWS cannot reach shows in the block of the region it belongs to.",
      'Fill both regions and submit. The deployments list shows the Version with both regions covered. Open it: each region names the group that serves it.',
      `To see an uncovered region, save with High availability off. The one group is not scoped to a region, so the list shows both regions covered by default; a Version made through the API with one group scoped to ${PRIMARY} shows ${REPLICA} uncovered.`,
      `This server is hosted in ${PRIMARY}, so its worker controller scales only the groups that list ${PRIMARY}. Showing a failover needs a second server hosted in ${REPLICA}, which this scenario does not start.`,
    ],
  },
});
