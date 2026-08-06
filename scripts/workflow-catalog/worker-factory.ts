type WorkerClass<Options, Worker> = {
  create(options: Options): Promise<Worker>;
};

export const createWorkflowCatalogWorkerFactory = <Options, Worker>(
  workerClass: WorkerClass<Options, Worker>,
) => {
  return (options: Options) => workerClass.create(options);
};
