import { createRequire } from 'node:module';

import { Client, Connection, WorkflowFailedError } from '@temporalio/client';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import * as activities from '../temporal/activities/index';
import {
  CatalogSyncWorkflow,
  choosePlanUpdate,
  emailVerifiedSignal,
  publishSignal,
  rebalanceShardsUpdate,
  RefundRequestWorkflow,
  TrialSignupWorkflow,
} from '../temporal/workflows';

Runtime.install({ logger: new DefaultLogger('WARN') });

const require = createRequire(import.meta.url);

const address = process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7333';
const uiPort = process.env.VITE_DEV_PORT ?? '3100';
const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';
const taskQueue = 'lanes-scenarios';

const flag = (name: string) => process.argv.includes(`--${name}`);

const option = (name: string, fallback: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Three Lanes scenarios of rising complexity, each ending in a different
 * status:
 *
 * - TrialSignupWorkflow (simple, Running): signal, update, a running child
 *   and an activity that keeps retrying.
 * - RefundRequestWorkflow (medium, Failed): a timed-out child, a cancelled
 *   activity and a refund that fails after retries.
 * - CatalogSyncWorkflow (complex, Completed after continue-as-new): fan-out
 *   to regional children, one terminated, one cancelled, one retrying, with
 *   grandchildren, timers, a signal and an update.
 *
 * Pass --keep-worker to leave the worker polling, so the trial's CRM sync
 * keeps retrying; without it the trial stays Running with that activity
 * pending.
 */
async function main() {
  const suffix = option('suffix', Date.now().toString(36));
  const trialId = `trial-signup-${suffix}`;
  const refundId = `refund-order-${suffix}`;
  const catalogId = `catalog-sync-${suffix}`;

  const nativeConnection = await NativeConnection.connect({ address });
  const worker = await Worker.create({
    connection: nativeConnection,
    namespace,
    taskQueue,
    workflowsPath: require.resolve('../temporal/workflows'),
    activities,
  });

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace });

  const waitForWorkflow = async (workflowId: string) => {
    for (;;) {
      try {
        await client.workflow.getHandle(workflowId).describe();
        return;
      } catch {
        await pause(250);
      }
    }
  };

  // The timeline walks a chain backwards from the run you open, so each link
  // opens the latest run.
  const timelineUrl = async (workflowId: string) => {
    const { runId } = await client.workflow.getHandle(workflowId).describe();
    return `  http://localhost:${uiPort}/namespaces/${namespace}/workflows/${workflowId}/${runId}/timeline?timeline_mode=lanes`;
  };

  const scenarios = async () => {
    const trial = await client.workflow.start(TrialSignupWorkflow, {
      taskQueue,
      workflowId: trialId,
      args: ['  Ada.Lovelace@Example.com '],
    });
    const refund = await client.workflow.start(RefundRequestWorkflow, {
      taskQueue,
      workflowId: refundId,
      args: [`order-${suffix}`],
    });
    const catalog = await client.workflow.start(CatalogSyncWorkflow, {
      taskQueue,
      workflowId: catalogId,
      args: [{ syncId: catalogId }],
    });

    // The user picks a plan, then verifies their email.
    await pause(1500);
    await trial.executeUpdate(choosePlanUpdate, { args: ['team'] });
    await trial.signal(emailVerifiedSignal);

    // APAC's manifest never arrives, so an operator terminates the sync.
    const apacId = `${catalogId}-p1-apac`;
    await waitForWorkflow(apacId);
    await pause(1500);
    await client.workflow
      .getHandle(apacId)
      .terminate('Manifest never arrived; terminated by the on-call operator');

    // On the second page, shards are rebalanced before publishing.
    await waitForWorkflow(`${catalogId}-p2-us`);
    await pause(1500);
    await client.workflow
      .getHandle(catalogId)
      .executeUpdate(rebalanceShardsUpdate, { args: [8] });
    await pause(4000);
    await client.workflow.getHandle(catalogId).signal(publishSignal);

    try {
      await refund.result();
    } catch (error) {
      if (!(error instanceof WorkflowFailedError)) throw error;
    }
    await catalog.result();

    // Let the CRM sync rack up a few retries before the worker stops.
    await pause(8000);
  };

  console.log(`Lanes scenarios: suffix=${suffix}`);
  if (flag('keep-worker')) {
    void scenarios().then(() =>
      console.log('Scenarios done. Worker stays up. Ctrl-C to stop.'),
    );
    await worker.run();
  } else {
    await worker.runUntil(scenarios());
  }

  console.log('Simple, still running:');
  console.log(await timelineUrl(trialId));
  console.log('Medium, failed:');
  console.log(await timelineUrl(refundId));
  console.log('Complex, completed after continuing as new:');
  console.log(await timelineUrl(catalogId));

  await nativeConnection.close();
  connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
