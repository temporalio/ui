import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: 'multi-region-compute',
  title: 'Compute per Namespace region for serverless Workers',
  summary:
    "Shows which regions a Worker Deployment Version covers, and the region nothing serves — the one a failover finds no workers in. The UI reads a Namespace's regions from its replication config, so the display needs a Namespace on more than one cluster. A dev server cannot provide that, so this scenario does not start one: point it at a multi-cluster deployment and it drives the UI against it.",
  server: {
    // Deliberately off. `start-dev` names every instance "active", so two of
    // them cannot be registered to each other: the second upsert is refused
    // with "Cannot update current cluster metadata from rpc calls". A Namespace
    // on one cluster is single region, which is the correct result and shows
    // nothing. The run points the UI at 127.0.0.1:7233, so put a multi-cluster
    // frontend there — directly, or over a tunnel.
    enabled: false,
    port: 7233,
  },
  // The catalog cannot exercise this feature, so it is left out rather than
  // started for appearance. The catalog worker is unversioned — it declares no
  // deployment name or build id — so it registers no Worker Deployment and the
  // deployments list stays empty. Even a versioned one would not help: a
  // compute config is attached through UpdateWorkerDeploymentVersionComputeConfig,
  // not by a Worker describing itself, and nothing here renders from workflow
  // history. The Versions this screen needs are created through the UI's own
  // serverless Worker form, or the CLI.
  worker: { enabled: false },
  examples: [],
  preview: {
    notes: [
      'Prerequisite: a frontend on 127.0.0.1:7233 belonging to a deployment with at least two clusters, and a global Namespace replicated across them. `temporal operator namespace describe -n <ns>` must show more than one entry under ReplicationConfig.Clusters, with ActiveClusterName naming one of them. Everything below renders from that response.',
      'Open the Worker Deployments list for that Namespace. Each Version with a compute config shows one badge per Namespace region. The badge for the active cluster reads Primary and the rest read Replica, taken from ActiveClusterName rather than from list order.',
      'A Namespace on a single cluster must show no regions at all, on the list and on the detail page. One region is not multi-region, and this is what every ordinary deployment looks like.',
      'Open a Version. Its regions appear with what serves each one. A scaling group carrying a region_id serves that region; a group without one is a catch-all and is named as covering the region by default, which is not the same as being configured for it.',
      'The case worth seeing: a region nothing serves is the only one coloured, and it is where a failover finds no workers. Until temporalio/api#875 lands, no scaling group carries a region_id, so every group reads as a catch-all and every region reads as covered by default. That is honest — it is precisely the state where no region-specific compute exists — but it means the uncovered case cannot be produced against a stock server.',
      "To see per-region matching, the server needs region_id on ComputeConfigScalingGroup. Build one with TEMPORAL_SERVER_REPO pointed at a checkout carrying temporalio/api#875, then give one Version a scaling group naming only one of the Namespace's regions. The other region must then read as uncovered.",
      'Region identifiers are shown as the server spells them. This repo does not split them, because it does not own the format: a cluster named "us-east-1" is a whole identifier, and shortening it by its first hyphen would display "east-1". A caller that knows its own format passes a label.',
    ],
  },
});
