import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
import type {
  NexusOperationIdConflictPolicy,
  NexusOperationIdReusePolicy,
} from '$lib/types';

export interface StartNexusOperationFormData {
  namespace: string;
  identity: string;
  operationId: string;
  endpoint: string;
  service: string;
  operation: string;
  input: string | undefined;
  encoding: PayloadInputEncoding;
  messageType: string | undefined;
  scheduleToCloseTimeout: string | undefined;
  scheduleToStartTimeout: string | undefined;
  startToCloseTimeout: string | undefined;
  idReusePolicy: NexusOperationIdReusePolicy | '';
  idConflictPolicy: NexusOperationIdConflictPolicy | '';
  nexusHeader: { key: string; value: string }[];
  searchAttributes: SearchAttributesSchema;
  summary: string | undefined;
  details: string | undefined;
}

export type StartNexusOperationFormDefaults = Pick<
  StartNexusOperationFormData,
  | 'namespace'
  | 'identity'
  | 'encoding'
  | 'operationId'
  | 'endpoint'
  | 'service'
  | 'operation'
> & {
  scheduleToCloseTimeout: string;
  startToCloseTimeout: string;
};
