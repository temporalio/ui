import { z } from 'zod';

export const ListNamespacesResponse = z.object({
  namespaces: z.array(z.any()).optional(),
  nextPageToken: z.string().optional(),
});
export type ListNamespacesResponse = z.infer<typeof ListNamespacesResponse>;
