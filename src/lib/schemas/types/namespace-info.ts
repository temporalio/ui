import { z } from 'zod';

export const NamespaceInfo = z.object({
  name: z.string().optional(),
  state: z
    .enum([
      'NAMESPACE_STATE_UNSPECIFIED',
      'NAMESPACE_STATE_REGISTERED',
      'NAMESPACE_STATE_DEPRECATED',
      'NAMESPACE_STATE_DELETED',
    ])
    .optional(),
  description: z.string().optional(),
  ownerEmail: z.string().optional(),
  /**A key-value map for any customized purpose.*/
  data: z
    .record(z.string())
    .describe('A key-value map for any customized purpose.')
    .optional(),
  id: z.string().optional(),
  /**All capabilities the namespace supports.*/
  capabilities: z
    .any()
    .describe('All capabilities the namespace supports.')
    .optional(),
  /**
   * Whether scheduled workflows are supported on this namespace. This is only needed
   *  temporarily while the feature is experimental, so we can give it a high tag.
   */
  supportsSchedules: z
    .boolean()
    .describe(
      'Whether scheduled workflows are supported on this namespace. This is only needed\n temporarily while the feature is experimental, so we can give it a high tag.',
    )
    .optional(),
});
export type NamespaceInfo = z.infer<typeof NamespaceInfo>;
