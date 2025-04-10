import { z } from 'zod';

/**[cleanup-wv-pre-release] Pre-release deployment APIs, clean up later*/
export const SetCurrentDeploymentRequest = z
  .object({
    namespace: z.string().optional(),
    deployment: z.any().optional(),
    /**Optional. The identity of the client who initiated this request.*/
    identity: z
      .string()
      .describe(
        'Optional. The identity of the client who initiated this request.',
      )
      .optional(),
    /**
     * Optional. Use to add or remove user-defined metadata entries. Metadata entries are exposed
     *  when describing a deployment. It is a good place for information such as operator name,
     *  links to internal deployment pipelines, etc.
     */
    updateMetadata: z
      .any()
      .describe(
        'Optional. Use to add or remove user-defined metadata entries. Metadata entries are exposed\n when describing a deployment. It is a good place for information such as operator name,\n links to internal deployment pipelines, etc.',
      )
      .optional(),
  })
  .describe(
    '[cleanup-wv-pre-release] Pre-release deployment APIs, clean up later',
  );
export type SetCurrentDeploymentRequest = z.infer<
  typeof SetCurrentDeploymentRequest
>;
