import { z } from 'zod';

export const UpdateNamespaceRequest = z.object({
  namespace: z.string().optional(),
  updateInfo: z.any().optional(),
  config: z.any().optional(),
  replicationConfig: z.any().optional(),
  securityToken: z.string().optional(),
  deleteBadBinary: z.string().optional(),
  /**promote local namespace to global namespace. Ignored if namespace is already global namespace.*/
  promoteNamespace: z
    .boolean()
    .describe(
      'promote local namespace to global namespace. Ignored if namespace is already global namespace.',
    )
    .optional(),
});
export type UpdateNamespaceRequest = z.infer<typeof UpdateNamespaceRequest>;
