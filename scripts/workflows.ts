import { connect, startWorkflows } from '../temporal/client';
import { runWorkersUntil } from '../temporal/workers';

async function main() {
  const client = await connect();
  const result = startWorkflows(client);
  await runWorkersUntil(result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
