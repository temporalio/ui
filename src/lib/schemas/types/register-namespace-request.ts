import { z } from 'zod';

export const RegisterNamespaceRequest = z.object({
  namespace: z.string().optional(),
  description: z.string().optional(),
  ownerEmail: z.string().optional(),
  workflowExecutionRetentionPeriod: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .optional(),
  clusters: z.array(z.any()).optional(),
  activeClusterName: z.string().optional(),
  /**A key-value map for any customized purpose.*/
  data: z
    .record(z.string())
    .describe('A key-value map for any customized purpose.')
    .optional(),
  securityToken: z.string().optional(),
  isGlobalNamespace: z.boolean().optional(),
  /**If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used.*/
  historyArchivalState: z
    .enum([
      'ARCHIVAL_STATE_UNSPECIFIED',
      'ARCHIVAL_STATE_DISABLED',
      'ARCHIVAL_STATE_ENABLED',
    ])
    .describe(
      'If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used.',
    )
    .optional(),
  historyArchivalUri: z.string().optional(),
  /**If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used.*/
  visibilityArchivalState: z
    .enum([
      'ARCHIVAL_STATE_UNSPECIFIED',
      'ARCHIVAL_STATE_DISABLED',
      'ARCHIVAL_STATE_ENABLED',
    ])
    .describe(
      'If unspecified (ARCHIVAL_STATE_UNSPECIFIED) then default server configuration is used.',
    )
    .optional(),
  visibilityArchivalUri: z.string().optional(),
});
export type RegisterNamespaceRequest = z.infer<typeof RegisterNamespaceRequest>;
