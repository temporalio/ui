export type NexusEndpoint = {
  version: string;
  id: string;
  spec: {
    name: string;
    description?: string;
    target: {
      worker: {
        namespace: string;
        taskQueue: string;
      };
      external?: {
        url: string;
      };
    };
  };
  createdTime: string;
  lastModifiedTime: string;
  urlPrefix: string;
};
