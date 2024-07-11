import type { Endpoint, EndpointSpec } from '$lib/types';

export interface NexusEndpointSpec extends EndpointSpec {
  descriptionString?: string;
  allowedCallerNamespaces?: string[];
}
export interface NexusEndpoint extends Endpoint {
  asyncOperationId?: string;
  state?: string;
  spec?: NexusEndpointSpec;
}
