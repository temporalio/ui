import { z } from 'zod';

export const StopBatchOperationResponse = z.object({});
export type StopBatchOperationResponse = z.infer<
  typeof StopBatchOperationResponse
>;
