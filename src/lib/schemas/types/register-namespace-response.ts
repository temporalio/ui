import { z } from 'zod';

export const RegisterNamespaceResponse = z.object({});
export type RegisterNamespaceResponse = z.infer<
  typeof RegisterNamespaceResponse
>;
