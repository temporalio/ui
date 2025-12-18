import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import type { SearchAttributeInput } from '$lib/stores/search-attributes';

export interface StandaloneActivityFormData {
  identity: string;
  namespace: string;
  id: string;
  taskQueue: string;
  type: string;
  startToCloseTimeout: string;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  input?: string;
  encoding?: PayloadInputEncoding;
  messageType?: string;
  searchAttributes?: SearchAttributeInput[];
  summary?: string;
  details?: string;
}
