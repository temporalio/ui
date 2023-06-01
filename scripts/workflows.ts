import { connect, startWorkflows } from '../temporal/client';
import { runWorkers } from '../temporal/workers';

async function main() {
  const client = await connect();
  const wfs = await startWorkflows(client);
  await runWorkers(wfs.map((wf) => wf.result()));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
