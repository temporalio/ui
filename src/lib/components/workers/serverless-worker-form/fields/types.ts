import type { Component, Snippet } from 'svelte';

import type { ComputeProviderTemplates } from '../compute-providers';
import type { ComputeRegion } from '../multi-region';
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
}

export type ComputeSection = Component<ComputeSectionProps>;

/**
 * What a provider that draws its own section is given.
 *
 * The region-shaped layout is the form's default, not every provider's truth.
 * A Modal Function is named by App and Function and has no region of its own,
 * so a replica toggle and a failover strip offer it a choice it cannot make.
 * A provider that declares a section replaces that layout with its own.
 *
 * It is handed the fields rather than rendering them, which keeps the registry
 * free of a cycle: a section that imported ComputeFields would import the
 * registry back through it, and COMPUTE_PROVIDERS would be undefined by the
 * time shared.ts read it.
 */
export interface ComputeProviderSectionProps {
  /** This provider's fields, already built by the form. */
  fields: Snippet;
  /**
   * The Namespace region the worker controller runs in. A section names it
   * only where it means something; the group saves it either way.
   */
  region?: ComputeRegion;
  /** A server error that named this section's region. */
  serverError?: string;
}

export type ComputeProviderSection = Component<ComputeProviderSectionProps>;
