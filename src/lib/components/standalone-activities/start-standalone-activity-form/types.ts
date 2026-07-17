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
  // retry policy; numeric fields are held as strings (bound to number inputs)
  // and coerced when the request is built.
  initialInterval: string;
  backoffCoefficient: string;
  maximumInterval: string;
  maximumAttempts: string;
}

export type StandaloneActivityFormDefaults = Pick<
  StandaloneActivityFormData,
  | 'identity'
  | 'namespace'
  | 'encoding'
  | 'activityId'
  | 'activityType'
  | 'taskQueue'
> & {
  startToCloseTimeout: string;
  scheduleToCloseTimeout: string;
};
