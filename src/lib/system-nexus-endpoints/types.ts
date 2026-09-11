import type { DescMessage } from '@bufbuild/protobuf';
import type { Component } from 'svelte';

import type { EventTypeCategory } from '$lib/models/event-history/get-event-categorization';
import type { Payload } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';

export const SYSTEM_NEXUS_ENDPOINT = '__temporal_system';

export type SystemNexusOperationKind = 'signal-with-start-workflow';

export type SystemNexusContext = {
  namespace?: string;
  workflow?: string;
  run?: string;
  /**
   * The operation's NexusOperationScheduled event. A terminal event carries no
   * endpoint of its own, so this is how it is confirmed to belong to the system
   * endpoint rather than to a tenant's own Nexus endpoint.
   */
  initiatingEvent?: WorkflowEvent;
};

export type SystemNexusLinkKind = 'target-execution' | 'initiated-event';

export type SystemNexusLink = {
  kind: SystemNexusLinkKind;
  label: string;
  value: string;
  href?: string;
};

export type SystemNexusTarget = {
  namespace?: string;
  workflowId?: string;
  runId?: string;
  eventId?: string;
};

/**
 * Everything a host component needs to render one system Nexus event. Host
 * components ask for this and render it; they never branch on the operation.
 */
export type SystemNexusPresentation = {
  kind: SystemNexusOperationKind;
  displayName: string;
  /** Raw Nexus wrapper fields the card should not show. */
  hiddenFields: string[];
  /** Extra detail rows injected into the expanded card. */
  attributes?: Record<string, string>;
  /** Link rows, in render order. */
  links: SystemNexusLink[];
  /** What the collapsed history row leads with, when not a link. */
  summaryAttribute?: { key: string; value: string };
  /** Category driving timeline colour and icon. */
  timelineCategory: EventTypeCategory;
  /**
   * Whether expanding one event of the group opens only that event. Synchronous
   * operations pair near-identical events, so opening both is redundant.
   */
  expandsIndividually: boolean;
};

export type SystemNexusInputRendererProps = {
  payload: Payload;
  maxHeight?: number;
};

/**
 * One entry per system Nexus operation. Adding an operation means adding a
 * directory with a definition and registering it — nothing else changes.
 */
export type SystemNexusOperationDefinition = {
  kind: SystemNexusOperationKind;
  /** `operation` on NexusOperationScheduled attributes. */
  operationName: string;
  /** Fully-qualified proto message types for the operation's request/response. */
  requestMessageType: string;
  responseMessageType: string;
  /** Schemas used to decode those payloads. Registered here so adding an
   * operation never means editing a second table elsewhere. */
  requestSchema: DescMessage;
  responseSchema: DescMessage;
  /** Human label, e.g. "Signal With Start Workflow Execution". */
  label: string;
  /** Event-name suffix remapping, e.g. Scheduled -> Initiated. */
  stateVerbs: Record<string, string>;
  hiddenFields: string[];
  timelineCategory: EventTypeCategory;
  expandsIndividually: boolean;
  /** Component rendering the operation's input payload. */
  InputRenderer: Component<SystemNexusInputRendererProps>;
  /** Builds the presentation for the operation's initiating event. */
  describeInitiated: (
    event: WorkflowEvent,
    context: SystemNexusContext,
  ) => Omit<
    SystemNexusPresentation,
    'kind' | 'timelineCategory' | 'expandsIndividually'
  > | null;
  /** Builds the presentation for the operation's terminal event. */
  describeTerminal: (
    event: WorkflowEvent,
    context: SystemNexusContext,
  ) => Omit<
    SystemNexusPresentation,
    'kind' | 'timelineCategory' | 'expandsIndividually'
  > | null;
};
