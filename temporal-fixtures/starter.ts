import { connect, startWorkflows } from '$temporal-fixtures/client';
import { runWorkers } from '$temporal-fixtures/workers';

async function main() {
  const client = await connect();
  const wfs = await startWorkflows(client);
  await runWorkers(wfs.map((wf) => wf.result()));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
