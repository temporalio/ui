import { get, writable } from 'svelte/store';

import { goto } from '$app/navigation';

import type { ScheduleFormData } from '$lib/components/schedule/schedule-form/schema';
import {
  formDataToCreateScheduleRequest,
  formDataToEditScheduleRequest,
} from '$lib/components/schedule/schedule-form/utilities/form-data-to-request-data';
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
import type { Schedule } from '$lib/types';
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

export function clearScheduleTimeouts() {
  scheduleTimeouts.forEach(clearTimeout);
  scheduleTimeouts.clear();
}

type ConfirmationModal = 'none' | 'delete' | 'pause' | 'trigger' | 'backfill';
export const confirmationModal = writable<ConfirmationModal>('none');

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
  formData: ScheduleFormData,
  context: Omit<ScheduleContext, 'scheduleId'>,
): Promise<void> {
  const { namespace, identity } = context;

  let body: ScheduleRequestBody;
  try {
    body = await formDataToCreateScheduleRequest(formData);
  } catch (e) {
    serverError.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
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
  formData: ScheduleFormData,
  schedule: Schedule,
  context: ScheduleContext,
): Promise<void> {
  const { namespace, identity, scheduleId } = context;

  let body: ScheduleRequestBody;
  try {
    body = await formDataToEditScheduleRequest(formData, schedule, scheduleId);
  } catch (e) {
    serverError.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
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
        error: e?.message,
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
          error: e?.message,
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
    actionPending.set(true);
    serverError.set(
      translate('schedules.trigger-schedule-error', {
        error: e?.message,
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
        actionPending.set(true);
        serverError.set('');
        refreshCurrentScheduleFetch({ namespace, scheduleId });
        closeConfirmationModal('backfill');
      },
      1000,
    );
  } catch (e) {
    actionPending.set(true);
    serverError.set(
      translate('schedules.backfill-schedule-error', {
        error: e?.message,
      }),
    );
  }
}

export const currentScheduleFetch =
  writable<Promise<DescribeFullSchedule | null>>(null);

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
