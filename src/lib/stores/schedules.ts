import { get, writable } from 'svelte/store';

import { goto } from '$app/navigation';

import type { FormScheduleSchema } from '$lib/components/schedule/schema/form';
import { getRequestBody } from '$lib/components/schedule/utilities/get-request-body';
import { translate } from '$lib/i18n/translate';
import {
  backfillRequest,
  createSchedule,
  deleteSchedule,
  editSchedule,
  fetchSchedule,
  pauseSchedule,
  triggerImmediately,
  unpauseSchedule,
} from '$lib/services/schedule-service';
import type {
  DescribeFullSchedule,
  OverlapPolicy,
  ScheduleRequestBody,
} from '$lib/types/schedule';
import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';

type ScheduleContext = {
  namespace: string;
  identity?: string;
  scheduleId: string;
};

type ScheduleAction =
  | 'create'
  | 'edit'
  | 'delete'
  | 'pause'
  | 'trigger'
  | 'backfill';

const scheduleTimeouts = new Map<
  ScheduleAction,
  ReturnType<typeof setTimeout>
>();

function setScheduleTimeout(
  action: ScheduleAction,
  callback: () => void,
  delay = 2000,
) {
  clearTimeout(scheduleTimeouts.get(action));
  scheduleTimeouts.set(action, setTimeout(callback, delay));
}

function clearScheduleTimeout(action: ScheduleAction) {
  clearTimeout(scheduleTimeouts.get(action));
}

type ConfirmationModal = 'none' | 'delete' | 'pause' | 'trigger' | 'backfill';
export const confirmationModal = writable<ConfirmationModal>('none');

export function clearConfirmationModalActionTimeout(
  modal: Exclude<ConfirmationModal, 'none'>,
) {
  actionPending.set(false);
  clearScheduleTimeout(modal);
}

export function openConfirmationModal(
  modal: Exclude<ConfirmationModal, 'none'>,
) {
  serverError.set('');
  confirmationModal.set(modal);
}

export function closeConfirmationModal(
  modal?: Exclude<ConfirmationModal, 'none'>,
) {
  if (modal && get(confirmationModal) !== modal) {
    return;
  }

  serverError.set('');
  confirmationModal.set('none');
}

export async function submitCreateSchedule(
  formData: FormScheduleSchema,
  context: Omit<ScheduleContext, 'scheduleId'>,
): Promise<void> {
  const { namespace, identity } = context;

  let body: ScheduleRequestBody;
  try {
    body = await getRequestBody(formData);
  } catch (e) {
    serverError.set(
      `${translate('data-encoder.encode-error')}: ${(e as Error)?.message}`,
    );
    return;
  }

  loading.set(true);
  const { error: err } = await createSchedule({
    identity,
    scheduleId: formData.name,
    namespace,
    body,
  });

  if (err) {
    serverError.set(err);
    loading.set(false);
  } else {
    setScheduleTimeout('create', () => {
      serverError.set('');
      loading.set(false);
      goto(routeForSchedules({ namespace }));
    });
  }
}

export async function submitEditSchedule(
  formData: FormScheduleSchema,
  schedule: DescribeFullSchedule,
  context: ScheduleContext,
): Promise<void> {
  const { namespace, identity, scheduleId } = context;

  let body: ScheduleRequestBody;
  try {
    body = await getRequestBody(formData, schedule);
  } catch (e) {
    serverError.set(
      `${translate('data-encoder.encode-error')}: ${(e as Error)?.message}`,
    );
    return;
  }

  loading.set(true);
  const { error: err } = await editSchedule({
    identity,
    namespace,
    scheduleId,
    body,
  });

  if (err) {
    serverError.set(err);
    loading.set(false);
  } else {
    setScheduleTimeout('edit', () => {
      goto(routeForSchedule({ namespace, scheduleId: formData.name }));
      serverError.set('');
      loading.set(false);
    });
  }
}

export async function submitDeleteSchedule(context: ScheduleContext) {
  const { namespace, identity, scheduleId } = context;
  serverError.set('');

  try {
    actionPending.set(true);
    await deleteSchedule({ identity, namespace, scheduleId });

    setScheduleTimeout('delete', () => {
      actionPending.set(false);
      closeConfirmationModal('delete');
      serverError.set('');
      currentScheduleFetch.set(Promise.resolve(null));
      goto(routeForSchedules({ namespace }));
    });
  } catch (e) {
    actionPending.set(false);
    serverError.set(
      translate('schedules.delete-schedule-error', {
        error: (e as Error)?.message,
      }),
    );
  }
}

export async function submitPauseSchedule(
  reason: string,
  context: ScheduleContext & { isPaused: boolean },
) {
  const { namespace, identity, scheduleId, isPaused } = context;
  serverError.set('');

  try {
    actionPending.set(true);

    await (isPaused
      ? unpauseSchedule({
          identity,
          namespace,
          scheduleId,
          reason,
        })
      : pauseSchedule({
          identity,
          namespace,
          scheduleId,
          reason,
        }));

    refreshCurrentScheduleFetch({ namespace, scheduleId });
    closeConfirmationModal('pause');
    serverError.set('');
  } catch (e) {
    serverError.set(
      translate(
        isPaused
          ? 'schedules.pause-schedule-error'
          : 'schedules.unpause-schedule-error',
        {
          error: (e as Error)?.message,
        },
      ),
    );
  } finally {
    actionPending.set(false);
  }
}

export async function submitTriggerImmediatelySchedule(
  overlapPolicy: OverlapPolicy,
  context: ScheduleContext,
) {
  const { namespace, identity, scheduleId } = context;
  serverError.set('');

  try {
    actionPending.set(true);

    await triggerImmediately({
      identity,
      namespace,
      scheduleId,
      overlapPolicy,
    });

    setScheduleTimeout(
      'trigger',
      () => {
        actionPending.set(false);
        serverError.set('');
        refreshCurrentScheduleFetch({ namespace, scheduleId });
        closeConfirmationModal('trigger');
      },
      1000,
    );
  } catch (e) {
    actionPending.set(false);
    serverError.set(
      translate('schedules.trigger-schedule-error', {
        error: (e as Error)?.message,
      }),
    );
  }
}

export async function submitBackfillSchedule(
  {
    startTime,
    endTime,
    overlapPolicy,
  }: {
    startTime: string;
    endTime: string;
    overlapPolicy: OverlapPolicy;
  },
  context: ScheduleContext,
) {
  const { namespace, identity, scheduleId } = context;
  serverError.set('');

  try {
    actionPending.set(true);

    await backfillRequest({
      identity,
      namespace,
      scheduleId,
      overlapPolicy,
      startTime,
      endTime,
    });

    setScheduleTimeout(
      'backfill',
      () => {
        actionPending.set(false);
        serverError.set('');
        refreshCurrentScheduleFetch({ namespace, scheduleId });
        closeConfirmationModal('backfill');
      },
      1000,
    );
  } catch (e) {
    actionPending.set(false);
    serverError.set(
      translate('schedules.backfill-schedule-error', {
        error: (e as Error)?.message,
      }),
    );
  }
}

export const currentScheduleFetch =
  writable<Promise<DescribeFullSchedule | null> | null>(null);

export function refreshCurrentScheduleFetch(
  context: Pick<ScheduleContext, 'namespace' | 'scheduleId'>,
) {
  currentScheduleFetch.set(fetchSchedule(context));
}

export const schedulesRefresh = writable(0);

export const loading = writable(false);
export const actionPending = writable(false);

export const serverError = writable('');

export const schedulesCount = writable({
  count: 0,
  newCount: 0,
});
