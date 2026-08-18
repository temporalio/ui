import { describe, expect, it } from 'vitest';

import { parseCatalogConnectionConfig } from './connection-config';

describe('parseCatalogConnectionConfig', () => {
  it('decodes staging mTLS credentials into the Temporal SDK TLS shape', () => {
    expect(
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'staging.example:7233',
        TEMPORAL_TLS_CLIENT_CERT_BASE64: Buffer.from(
          'staging-certificate',
        ).toString('base64'),
        TEMPORAL_TLS_CLIENT_KEY_BASE64: Buffer.from(
          'staging-private-key',
        ).toString('base64'),
        TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64:
          Buffer.from('staging-root-ca').toString('base64'),
      }),
    ).toEqual({
      address: 'staging.example:7233',
      tls: {
        serverRootCACertificate: Buffer.from('staging-root-ca'),
        clientCertPair: {
          crt: Buffer.from('staging-certificate'),
          key: Buffer.from('staging-private-key'),
        },
      },
    });
  });

  it('passes the optional TLS server name override to the Temporal SDK', () => {
    const environment = {
      TEMPORAL_ADDRESS: 'staging.example:7233',
      TEMPORAL_TLS_CLIENT_CERT_BASE64: Buffer.from(
        'staging-certificate',
      ).toString('base64'),
      TEMPORAL_TLS_CLIENT_KEY_BASE64: Buffer.from(
        'staging-private-key',
      ).toString('base64'),
      TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64:
        Buffer.from('staging-root-ca').toString('base64'),
      TEMPORAL_TLS_SERVER_NAME_OVERRIDE: 'temporal.internal',
    };

    expect(parseCatalogConnectionConfig(environment)).toMatchObject({
      tls: { serverNameOverride: 'temporal.internal' },
    });
  });

  it('uses system server trust when staging provides only a client certificate pair', () => {
    expect(
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'staging.example:7233',
        TEMPORAL_TLS_CLIENT_CERT_BASE64: Buffer.from(
          'staging-certificate',
        ).toString('base64'),
        TEMPORAL_TLS_CLIENT_KEY_BASE64: Buffer.from(
          'staging-private-key',
        ).toString('base64'),
      }),
    ).toEqual({
      address: 'staging.example:7233',
      tls: {
        clientCertPair: {
          crt: Buffer.from('staging-certificate'),
          key: Buffer.from('staging-private-key'),
        },
      },
    });
  });

  it.each([
    { TEMPORAL_TLS_CLIENT_CERT_BASE64: 'certificate' },
    { TEMPORAL_TLS_CLIENT_KEY_BASE64: 'private-key' },
  ])(
    'names both required staging mTLS variables when the client pair is incomplete',
    (credentials) => {
      expect(() =>
        parseCatalogConnectionConfig({
          TEMPORAL_ADDRESS: 'staging.example:7233',
          ...credentials,
        }),
      ).toThrowError(
        'TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64 must be provided together',
      );
    },
  );

  it('rejects a TLS server name override without a client certificate pair', () => {
    expect(() =>
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'staging.example:7233',
        TEMPORAL_TLS_SERVER_NAME_OVERRIDE: 'temporal.internal',
      }),
    ).toThrowError(
      'TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64 are required when TEMPORAL_TLS_SERVER_NAME_OVERRIDE is provided',
    );
  });

  it('rejects a TLS server root CA without a client certificate pair', () => {
    expect(() =>
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'staging.example:7233',
        TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64: 'root-ca',
      }),
    ).toThrowError(
      'TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64 are required when TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64 is provided',
    );
  });

  it('rejects staging mTLS credentials combined with an API key', () => {
    expect(() =>
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'staging.example:7233',
        TEMPORAL_API_KEY: 'api-key',
        TEMPORAL_TLS_CLIENT_CERT_BASE64: 'certificate',
        TEMPORAL_TLS_CLIENT_KEY_BASE64: 'private-key',
        TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64: 'root-ca',
      }),
    ).toThrowError('Catalog connection credentials cannot be mixed');
  });

  it('rejects simultaneous legacy and staging mTLS certificate pairs', () => {
    expect(() =>
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'staging.example:7233',
        TEMPORAL_TLS_CERT: 'legacy-certificate',
        TEMPORAL_TLS_KEY: 'legacy-private-key',
        TEMPORAL_TLS_CLIENT_CERT_BASE64: 'staging-certificate',
        TEMPORAL_TLS_CLIENT_KEY_BASE64: 'staging-private-key',
      }),
    ).toThrowError(
      'TEMPORAL_TLS_CERT and TEMPORAL_TLS_KEY cannot be combined with TEMPORAL_TLS_CLIENT_CERT_BASE64 and TEMPORAL_TLS_CLIENT_KEY_BASE64',
    );
  });

  it('keeps local connections plaintext', () => {
    expect(
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'localhost:7233',
      }),
    ).toEqual({ address: 'localhost:7233' });
  });

  it('supports API key credentials', () => {
    expect(
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'cloud.example:7233',
        TEMPORAL_API_KEY: 'api-key',
      }),
    ).toEqual({ address: 'cloud.example:7233', apiKey: 'api-key' });
  });

  it('preserves legacy client certificate compatibility', () => {
    expect(
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'mtls.example:7233',
        TEMPORAL_TLS_CERT: Buffer.from('certificate').toString('base64'),
        TEMPORAL_TLS_KEY: Buffer.from('private-key').toString('base64'),
      }),
    ).toEqual({
      address: 'mtls.example:7233',
      tls: {
        clientCertPair: {
          crt: Buffer.from('certificate'),
          key: Buffer.from('private-key'),
        },
      },
    });
  });

  it('requires a Temporal address', () => {
    expect(() => parseCatalogConnectionConfig({})).toThrowError(
      'TEMPORAL_ADDRESS is required',
    );
  });

  it('rejects legacy mTLS credentials combined with an API key', () => {
    expect(() =>
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'mixed.example:7233',
        TEMPORAL_API_KEY: 'api-key',
        TEMPORAL_TLS_CERT: 'certificate',
        TEMPORAL_TLS_KEY: 'private-key',
      }),
    ).toThrowError('Catalog connection credentials cannot be mixed');
  });

  it('rejects incomplete legacy mTLS credentials', () => {
    expect(() =>
      parseCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'partial.example:7233',
        TEMPORAL_TLS_CERT: 'certificate',
      }),
    ).toThrowError(
      'TEMPORAL_TLS_CERT and TEMPORAL_TLS_KEY must be provided together',
    );
  });
});
