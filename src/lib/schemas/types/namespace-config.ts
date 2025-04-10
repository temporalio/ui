import { z } from 'zod';

export const NamespaceConfig = z.object({
  workflowExecutionRetentionTtl: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .optional(),
  badBinaries: z.any().optional(),
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
  /**Map from field name to alias.*/
  customSearchAttributeAliases: z
    .record(z.string())
    .describe('Map from field name to alias.')
    .optional(),
});
export type NamespaceConfig = z.infer<typeof NamespaceConfig>;
