/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {}

  interface Platform {}

  interface Session {}

  interface PageData {
    workflow?: import('$types').WorkflowExecution;
    settings?: import('$types').Settings;
    cluster?: import('$types').ClusterInformation;
  }
}
