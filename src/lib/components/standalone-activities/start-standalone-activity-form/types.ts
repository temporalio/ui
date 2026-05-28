import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

export interface StandaloneActivityFormData {
  identity: string;
  namespace: string;
  activityId: string;
  taskQueue: string;
  activityType: string;
  startToCloseTimeout: string | undefined;
  scheduleToCloseTimeout: string | undefined;
  scheduleToStartTimeout: string | undefined;
  input: string | undefined;
  encoding: PayloadInputEncoding;
  messageType: string | undefined;
  searchAttributes: SearchAttributesSchema;
  summary: string | undefined;
  details: string | undefined;
  // retry policy
  initialInterval: string;
  backoffCoefficient: number | null | undefined;
  maximumInterval: string;
  maximumAttempts: number | null | undefined;
}

export type StandaloneActivityFormDefaults = Pick<
  StandaloneActivityFormData,
  | 'identity'
  | 'namespace'
  | 'encoding'
  | 'activityId'
  | 'activityType'
  | 'taskQueue'
  | 'startToCloseTimeout'
  | 'scheduleToCloseTimeout'
>;
