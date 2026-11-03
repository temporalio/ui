import type { Component } from 'svelte';

import type { ComputeProviderTemplates } from '../compute-providers';
import type { ComputeFieldErrors, ComputeFieldValues } from '../shared';

/**
 * What every provider field section is given.
 *
 * One shape for all of them, so the registry can hold them in a single slot
 * and ComputeFields can render whichever a provider declares without knowing
 * which provider it has.
 */
export interface ComputeSectionProps {
  /** Every provider field, read and written in place. */
  values: ComputeFieldValues;
  errors: ComputeFieldErrors;
  /** Prefixes field ids so the fields can render more than once on a page. */
  fieldId: (name: string) => string;
  /**
   * A suggestion for the resource field, when the consumer can make one. The
   * high availability form offers a regional ARN here; a provider with nothing
   * to suggest ignores it.
   */
  resourcePlaceholder?: string;
  /**
   * The regions this provider may deploy to, when the consumer names a list.
   * A provider that offers no regional choice ignores it.
   */
  deployRegions?: string[];
  /** The selected provider, for a section shared by more than one. */
  provider?: string;
  /** This provider's own templates, already picked out of the map. */
  templates?: ComputeProviderTemplates;
  /** The provider's published Terraform module, when it has one. */
  terraformModuleHref?: string;
  /**
   * True when the consumer supplied this provider's credential fields.
   *
   * A resource section reads it to drop a field the consumer's credentials
   * now determine. Modal's workspace is the case this exists for: typed in
   * open source, where one API key owns one workspace, but chosen with the
   * connection in Temporal Cloud, where the grant is per workspace. Without
   * this the picker and a text input would both claim the same value.
   */
  credentialsSupplied?: boolean;
}

export type ComputeSection = Component<ComputeSectionProps>;
