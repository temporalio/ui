import { z } from 'zod';

export const GetSystemInfoResponse = z.object({
  /**Version of the server.*/
  serverVersion: z.string().describe('Version of the server.').optional(),
  /**All capabilities the system supports.*/
  capabilities: z
    .any()
    .describe('All capabilities the system supports.')
    .optional(),
});
export type GetSystemInfoResponse = z.infer<typeof GetSystemInfoResponse>;
