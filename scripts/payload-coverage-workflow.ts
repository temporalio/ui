import { connect, startPayloadCoverageWorkflow } from '../temporal/client';
import { runWorkerUntil } from '../temporal/workers';

async function main() {
  const client = await connect();
  const result = startPayloadCoverageWorkflow(client);
  await runWorkerUntil(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
