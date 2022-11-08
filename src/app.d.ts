/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {}

  interface Platform {}

  interface Session {}

  interface Stuff {
    workflow?: WorkflowExecution;
    settings: Settings;
    workers?: GetPollersResponse;
    cluster?: ClusterInformation;
  }
}
