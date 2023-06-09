import { stopWorker } from '../temporal/workers';
import { getTemporalServer } from '../utilities/temporal-server';
import { getCodecServer } from '../temporal/codec-server';
import { disconnect, stopWorkflows } from '../temporal/client';

export default async function () {
  const temporal = getTemporalServer();
  const codecServer = getCodecServer();

  await stopWorkflows();
  await stopWorker();
  await disconnect();
  await codecServer.stop();
  await temporal.shutdown();
}
