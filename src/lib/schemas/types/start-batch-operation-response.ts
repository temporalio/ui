import { z } from 'zod';

export const StartBatchOperationResponse = z.object({});
export type StartBatchOperationResponse = z.infer<
  typeof StartBatchOperationResponse
>;
