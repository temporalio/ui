/* eslint-disable @typescript-eslint/no-empty-object-type */
/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Error {
    message: string;
    statusCode?: number;
  }

  interface Locals {}

  interface Platform {}

  interface Session {}

  interface PageData {
    workflow?: import('$types').WorkflowExecution;
    settings: import('$types').Settings;
    cluster?: import('$types').ClusterInformation;
  }
}
