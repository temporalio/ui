/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {}

  interface Platform {}

  interface Session {}

  interface Stuff {
    workflow?: WorkflowExecution;
    namespaces: ListNamespacesResponse;
    events?: WorkflowEvent[];
    eventGroups?: EventGroups;
    settings: Settings;
    matchingEvents?: WorkflowEvent[];
    matchingEventGroups?: EventGroups;
    workers?: GetPollersResponse;
  }
}
