import { temporal } from '@temporalio/proto';
import type { temporal as Temporal } from '@temporalio/proto';

export enum ResetType {
  FirstWorkflowTask = 0,
  LastWorkflowTask = 1,
  EventId = 2,
}

export const {
  api: {
    enums: {
      v1: { ResetReapplyType },
    },
  },
} = temporal;

export type TResetReapplyType = Temporal.api.enums.v1.ResetReapplyType;
