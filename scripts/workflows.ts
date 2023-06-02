import { connect, startWorkflows } from '../temporal/client';
import { runWorkerUntil } from '../temporal/workers';

async function main() {
  const client = await connect();
  const results = startWorkflows(client);
  await runWorkerUntil(results);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
