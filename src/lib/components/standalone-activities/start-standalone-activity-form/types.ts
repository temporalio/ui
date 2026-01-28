import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import type { SearchAttributeInput } from '$lib/stores/search-attributes';

export interface StandaloneActivityFormData {
  identity: string;
  namespace: string;
  activityId: string;
  taskQueue: string;
  activityType: string;
  startToCloseTimeout: string;
  scheduleToCloseTimeout?: string;
  scheduleToStartTimeout?: string;
  input?: string;
  encoding?: PayloadInputEncoding;
  messageType?: string;
  searchAttributes?: SearchAttributeInput[];
  summary?: string;
  details?: string;
  // retry policy
  initialInterval?: string;
  backoffCoefficient?: string;
  maximumInterval?: string;
  maximumAttempts?: string;
}
