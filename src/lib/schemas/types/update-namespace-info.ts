import { z } from 'zod';

export const UpdateNamespaceInfo = z.object({
  description: z.string().optional(),
  ownerEmail: z.string().optional(),
  /**
   * A key-value map for any customized purpose.
   *  If data already exists on the namespace,
   *  this will merge with the existing key values.
   */
  data: z
    .record(z.string())
    .describe(
      'A key-value map for any customized purpose.\n If data already exists on the namespace, \n this will merge with the existing key values.',
    )
    .optional(),
  /**
   * New namespace state, server will reject if transition is not allowed.
   *  Allowed transitions are:
   *   Registered -> [ Deleted | Deprecated | Handover ]
   *   Handover -> [ Registered ]
   *  Default is NAMESPACE_STATE_UNSPECIFIED which is do not change state.
   */
  state: z
    .enum([
      'NAMESPACE_STATE_UNSPECIFIED',
      'NAMESPACE_STATE_REGISTERED',
      'NAMESPACE_STATE_DEPRECATED',
      'NAMESPACE_STATE_DELETED',
    ])
    .describe(
      'New namespace state, server will reject if transition is not allowed.\n Allowed transitions are:\n  Registered -> [ Deleted | Deprecated | Handover ]\n  Handover -> [ Registered ]\n Default is NAMESPACE_STATE_UNSPECIFIED which is do not change state.',
    )
    .optional(),
});
export type UpdateNamespaceInfo = z.infer<typeof UpdateNamespaceInfo>;
