import { stopWorker } from '../temporal/workers';

export default async function () {
  await stopWorker();
}
