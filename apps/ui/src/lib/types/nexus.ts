import type {
  CallbackInfo,
  Endpoint,
  EndpointSpec,
  Callback as ICallback,
} from '$lib/types';
import type { EventLink } from '$lib/types';

export interface NexusEndpointSpec extends EndpointSpec {
  descriptionString?: string;
  allowedCallerNamespaces?: string[];
}
export interface NexusEndpoint extends Endpoint {
  asyncOperationId?: string;
  state?: string;
  spec?: NexusEndpointSpec;
}

export interface Callback extends CallbackInfo {
  blockedReason?: string;
  callback?: CallbackWithLinks;
}
interface CallbackWithLinks extends ICallback {
  links?: EventLink[];
}
