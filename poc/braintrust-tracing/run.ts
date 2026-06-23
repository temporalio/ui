import { createRequire } from 'node:module';

import { createBraintrustTemporalPlugin } from '@braintrust/temporal';
import { Client, Connection } from '@temporalio/client';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { flush, initLogger, traced } from 'braintrust';

import { CompletionDetailsInterceptor } from './details-interceptor';

const require = createRequire(import.meta.url);

const TASK_QUEUE = 'braintrust-tracing-demo';
const PROJECT_NAME = 'temporal-braintrust-poc';

const TICKETS = [
  "Hi, our production workflows are failing with StartToCloseTimeout errors on our payment processing activities. We're running Temporal Cloud with the Python SDK (v1.5.0) and the activities are calling an external payment API that sometimes takes 30+ seconds to respond. We've set the timeout to 10 seconds. How do we fix this without losing durability guarantees?",
  "We're seeing our workers crash intermittently with OOM errors. We have about 200 workflows running concurrently, each with 5-10 activities. The worker has 2GB memory. Is there a way to limit concurrency or tune memory usage? We're on the Go SDK v1.29.",
  "Our team is migrating from Cadence to Temporal. We have existing workflow definitions that use the old versioning approach with GetVersion. What's the recommended way to handle this migration? We need to keep the running workflows operational during the transition.",
];

const ticketIndex = parseInt(process.argv[2] ?? '0', 10) % TICKETS.length;
const SAMPLE_TICKET = TICKETS[ticketIndex];

async function main() {
  const braintrustApiKey = process.env.BRAINTRUST_API_KEY;
  if (!braintrustApiKey) {
    console.error('ERROR: BRAINTRUST_API_KEY not set');
    process.exit(1);
  }

  initLogger({ projectName: PROJECT_NAME, apiKey: braintrustApiKey });
  const braintrustPlugin = createBraintrustTemporalPlugin();

  Runtime.install({ logger: new DefaultLogger('WARN') });

  const connection = await Connection.connect();
  const clientOptions = braintrustPlugin.configureClient({ connection });
  const client = new Client(clientOptions);

  const activities = await import('./activities');

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: TASK_QUEUE,
    plugins: [braintrustPlugin],
    interceptors: {
      activity: [() => ({ inbound: new CompletionDetailsInterceptor() })],
    },
  });

  console.log('Worker started, executing workflow...\n');

  const result = await worker.runUntil(
    traced(
      async (span) => {
        span.log({ input: { ticketText: SAMPLE_TICKET } });

        const handle = await client.workflow.start('TicketTriageWorkflow', {
          taskQueue: TASK_QUEUE,
          args: [SAMPLE_TICKET],
          workflowId: `ticket-triage-${Date.now()}`,
        });

        console.log(`Workflow started: ${handle.workflowId}`);
        console.log(
          `Temporal UI: http://localhost:8233/namespaces/default/workflows/${handle.workflowId}\n`,
        );

        const workflowResult = await handle.result();
        span.log({ output: workflowResult });
        return workflowResult;
      },
      { name: 'api.triage_ticket', type: 'task' },
    ),
  );

  console.log('=== Workflow Result ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n=== Check Braintrust ===');
  console.log(
    `Open https://www.braintrust.dev/app/projects/${PROJECT_NAME}/logs to see the trace\n`,
  );

  console.log('Flushing spans to Braintrust...');
  await flush();
  console.log('Flush complete.');

  connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
