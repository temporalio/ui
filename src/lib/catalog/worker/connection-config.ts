export type CatalogConnectionConfig = {
  address: string;
  apiKey?: string;
  tls?: {
    serverRootCACertificate?: Uint8Array;
    serverNameOverride?: string;
    clientCertPair: {
      crt: Uint8Array;
      key: Uint8Array;
    };
  };
};

type CatalogConnectionEnvironment = Record<string, string | undefined>;

export const parseCatalogConnectionConfig = (
  environment: CatalogConnectionEnvironment,
): CatalogConnectionConfig => {
  const address = environment.TEMPORAL_ADDRESS;
  const apiKey = environment.TEMPORAL_API_KEY;
  const certificate = environment.TEMPORAL_TLS_CERT;
  const privateKey = environment.TEMPORAL_TLS_KEY;
  const clientCertificate = environment.TEMPORAL_TLS_CLIENT_CERT_BASE64;
  const clientPrivateKey = environment.TEMPORAL_TLS_CLIENT_KEY_BASE64;
  const serverRootCACertificate =
    environment.TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64;
  const serverNameOverride = environment.TEMPORAL_TLS_SERVER_NAME_OVERRIDE;

  if (!address) throw new Error('TEMPORAL_ADDRESS is required');

  if ((certificate || privateKey) && (clientCertificate || clientPrivateKey)) {
    throw new Error(
      'TEMPORAL_TLS_CERT and TEMPORAL_TLS_KEY cannot be combined with TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64',
    );
  }

  if (
    apiKey &&
    (certificate ||
      privateKey ||
      clientCertificate ||
      clientPrivateKey ||
      serverRootCACertificate)
  ) {
    throw new Error('Catalog connection credentials cannot be mixed');
  }

  if (Boolean(certificate) !== Boolean(privateKey)) {
    throw new Error(
      'TEMPORAL_TLS_CERT and TEMPORAL_TLS_KEY must be provided together',
    );
  }

  if (Boolean(clientCertificate) !== Boolean(clientPrivateKey)) {
    throw new Error(
      'TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64 must be provided together',
    );
  }

  if (serverRootCACertificate && !(clientCertificate && clientPrivateKey)) {
    throw new Error(
      'TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64 are required when TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64 is provided',
    );
  }

  if (serverNameOverride && !(clientCertificate && clientPrivateKey)) {
    throw new Error(
      'TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64 are required when TEMPORAL_TLS_SERVER_NAME_OVERRIDE is provided',
    );
  }

  if (apiKey) return { address, apiKey };
  if (clientCertificate && clientPrivateKey) {
    return {
      address,
      tls: {
        ...(serverNameOverride ? { serverNameOverride } : {}),
        ...(serverRootCACertificate
          ? {
              serverRootCACertificate: Buffer.from(
                serverRootCACertificate,
                'base64',
              ),
            }
          : {}),
        clientCertPair: {
          crt: Buffer.from(clientCertificate, 'base64'),
          key: Buffer.from(clientPrivateKey, 'base64'),
        },
      },
    };
  }
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
