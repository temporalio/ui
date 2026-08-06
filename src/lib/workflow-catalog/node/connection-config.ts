export type WorkflowCatalogConnectionConfig = {
  address: string;
  apiKey?: string;
  tls?: {
    clientCertPair: {
      crt: Uint8Array;
      key: Uint8Array;
    };
  };
};

type WorkflowCatalogConnectionEnvironment = Record<string, string | undefined>;

export const parseWorkflowCatalogConnectionConfig = (
  environment: WorkflowCatalogConnectionEnvironment,
): WorkflowCatalogConnectionConfig => {
  const address = environment.TEMPORAL_ADDRESS;
  const apiKey = environment.TEMPORAL_API_KEY;
  const certificate = environment.TEMPORAL_TLS_CERT;
  const privateKey = environment.TEMPORAL_TLS_KEY;

  if (!address) throw new Error('TEMPORAL_ADDRESS is required');

  if (apiKey && (certificate || privateKey)) {
    throw new Error('Workflow catalog connection credentials cannot be mixed');
  }

  if (Boolean(certificate) !== Boolean(privateKey)) {
    throw new Error(
      'TEMPORAL_TLS_CERT and TEMPORAL_TLS_KEY must be provided together',
    );
  }

  if (apiKey) return { address, apiKey };
  if (!certificate || !privateKey) return { address };

  return {
    address,
    tls: {
      clientCertPair: {
        crt: Buffer.from(certificate, 'base64'),
        key: Buffer.from(privateKey, 'base64'),
      },
    },
  };
};
