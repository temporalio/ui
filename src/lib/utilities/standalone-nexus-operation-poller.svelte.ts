import { writable, type Writable } from 'svelte/store';

import {
  getNexusOperationExecution,
  pollNexusOperationExecution,
} from '$lib/services/standalone-nexus-operations';
import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';

import { isEmptyObject } from './is';

export const nexusOperationExecution: Writable<
  NexusOperationExecution | undefined
> = writable();

export class StandaloneNexusOperationPoller {
  private abortController: AbortController;
  private namespace: string;
  private operationId: string;
  private runId: string;
  private token: string = '';
  private onUpdate: (nexusOperationExecution: NexusOperationExecution) => void;
  private onError: (error: Error) => void;

  constructor(
    namespace: string,
    operationId: string,
    runId: string,
    abortController: AbortController,
    onUpdate: (nexusOperationExecution: NexusOperationExecution) => void,
    onError: (error: Error) => void,
  ) {
    this.namespace = namespace;
    this.operationId = operationId;
    this.runId = runId;
    this.abortController = abortController;
    this.onUpdate = onUpdate;
    this.onError = onError;
  }

  async start() {
    let nexusOperationExecution: NexusOperationExecution | undefined =
      undefined;
    try {
      nexusOperationExecution = await getNexusOperationExecution(
        this.namespace,
        this.operationId,
        this.runId,
      );
    } catch (error) {
      this.onError(error as Error);
      return;
    }

    this.onUpdate(nexusOperationExecution);

    if (
      nexusOperationExecution.info.status ===
      'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING'
    ) {
      this.token = nexusOperationExecution.longPollToken ?? '';

      while (!this.abortController.signal.aborted) {
        try {
          const polledNexusOperationExecution =
            await pollNexusOperationExecution(
              this.namespace,
              this.operationId,
              this.runId,
              this.token,
              this.abortController.signal,
            );

          if (
            polledNexusOperationExecution &&
            !isEmptyObject(polledNexusOperationExecution)
          ) {
            this.token = polledNexusOperationExecution.longPollToken ?? '';
            this.onUpdate(polledNexusOperationExecution);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }

          this.onError(error as Error);
          break;
        }
      }
    }
  }

  async fetchOnce() {
    const nexusOperationExecution = await getNexusOperationExecution(
      this.namespace,
      this.operationId,
      this.runId,
    );
    this.onUpdate(nexusOperationExecution);
  }

  abort() {
    this.abortController.abort();
  }
}
