import { describe, expect, it } from 'vitest';

import { parseWorkflowCatalogConnectionConfig } from './connection-config';

describe('parseWorkflowCatalogConnectionConfig', () => {
  it('accepts one cluster credential mode and rejects mixed or partial credentials', () => {
    expect(
      parseWorkflowCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'localhost:7233',
      }),
    ).toEqual({ address: 'localhost:7233' });
    expect(
      parseWorkflowCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'cloud.example:7233',
        TEMPORAL_API_KEY: 'api-key',
      }),
    ).toEqual({ address: 'cloud.example:7233', apiKey: 'api-key' });
    expect(
      parseWorkflowCatalogConnectionConfig({
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

    expect(() => parseWorkflowCatalogConnectionConfig({})).toThrowError(
      'TEMPORAL_ADDRESS is required',
    );
    expect(() =>
      parseWorkflowCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'mixed.example:7233',
        TEMPORAL_API_KEY: 'api-key',
        TEMPORAL_TLS_CERT: 'certificate',
        TEMPORAL_TLS_KEY: 'private-key',
      }),
    ).toThrowError('Workflow catalog connection credentials cannot be mixed');
    expect(() =>
      parseWorkflowCatalogConnectionConfig({
        TEMPORAL_ADDRESS: 'partial.example:7233',
        TEMPORAL_TLS_CERT: 'certificate',
      }),
    ).toThrowError(
      'TEMPORAL_TLS_CERT and TEMPORAL_TLS_KEY must be provided together',
    );
  });
});
