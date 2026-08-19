type WorkerClass<Options, Worker> = {
  create(options: Options): Promise<Worker>;
};

export const createCatalogWorkerFactory = <Options, Worker>(
  workerClass: WorkerClass<Options, Worker>,
) => {
  return (options: Options) => workerClass.create(options);
};
