import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import type { SearchAttributeInput } from '$lib/stores/search-attributes';

export interface StandaloneActivityFormData {
  activityId: string;
  taskQueue: string;
  activityType: string;
  input?: string;
  encoding?: PayloadInputEncoding;
  searchAttributes?: SearchAttributeInput[];
  summary?: string;
  details?: string;
}
