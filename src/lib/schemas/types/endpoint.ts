import { z } from 'zod';

/**A cluster-global binding from an endpoint ID to a target for dispatching incoming Nexus requests.*/
export const Endpoint = z
  .object({
    /**Data version for this endpoint, incremented for every update issued via the UpdateNexusEndpoint API.*/
    version: z
      .string()
      .describe(
        'Data version for this endpoint, incremented for every update issued via the UpdateNexusEndpoint API.',
      )
      .optional(),
    /**Unique server-generated endpoint ID.*/
    id: z.string().describe('Unique server-generated endpoint ID.').optional(),
    /**Spec for the endpoint.*/
    spec: z.any().describe('Spec for the endpoint.').optional(),
    /**
     * The date and time when the endpoint was created.
     *  (-- api-linter: core::0142::time-field-names=disabled
     *      aip.dev/not-precedent: Not following linter rules. --)
     */
    createdTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'The date and time when the endpoint was created.\n (-- api-linter: core::0142::time-field-names=disabled\n     aip.dev/not-precedent: Not following linter rules. --)',
      )
      .optional(),
    /**
     * The date and time when the endpoint was last modified.
     *  Will not be set if the endpoint has never been modified.
     *  (-- api-linter: core::0142::time-field-names=disabled
     *      aip.dev/not-precedent: Not following linter rules. --)
     */
    lastModifiedTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'The date and time when the endpoint was last modified.\n Will not be set if the endpoint has never been modified.\n (-- api-linter: core::0142::time-field-names=disabled\n     aip.dev/not-precedent: Not following linter rules. --)',
      )
      .optional(),
    /**
     * Server exposed URL prefix for invocation of operations on this endpoint.
     *  This doesn't include the protocol, hostname or port as the server does not know how it should be accessed
     *  publicly. The URL is stable in the face of endpoint renames.
     */
    urlPrefix: z
      .string()
      .describe(
        "Server exposed URL prefix for invocation of operations on this endpoint.\n This doesn't include the protocol, hostname or port as the server does not know how it should be accessed\n publicly. The URL is stable in the face of endpoint renames.",
      )
      .optional(),
  })
  .describe(
    'A cluster-global binding from an endpoint ID to a target for dispatching incoming Nexus requests.',
  );
export type Endpoint = z.infer<typeof Endpoint>;
