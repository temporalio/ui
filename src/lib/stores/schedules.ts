import { writable } from 'svelte/store';

import { goto } from '$app/navigation';

import type { ScheduleFormData } from '$lib/components/schedule/schedule-form/schema';
import {
  formDataToCreateScheduleRequest,
  formDataToEditScheduleRequest,
} from '$lib/components/schedule/schedule-form/serialization';
import { translate } from '$lib/i18n/translate';
import { createSchedule, editSchedule } from '$lib/services/schedule-service';
import type { Schedule } from '$lib/types';
import type { ScheduleRequestBody } from '$lib/types/schedule';
import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';

type ScheduleContext = {
  namespace: string;
  identity?: string;
};

type EditScheduleContext = ScheduleContext & {
  scheduleId: string;
};

let createTimeout: ReturnType<typeof setTimeout>;
let editTimeout: ReturnType<typeof setTimeout>;

export const submitCreateSchedule = async (
  formData: ScheduleFormData,
  context: ScheduleContext,
): Promise<void> => {
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
    clearTimeout(createTimeout);
    createTimeout = setTimeout(() => {
      serverError.set('');
      loading.set(false);
      goto(routeForSchedules({ namespace }));
    }, 2000);
  }
};

export const submitEditSchedule = async (
  formData: ScheduleFormData,
  schedule: Schedule,
  context: EditScheduleContext,
): Promise<void> => {
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
    clearTimeout(editTimeout);
    editTimeout = setTimeout(() => {
      goto(routeForSchedule({ namespace, scheduleId: formData.name }));
      serverError.set('');
      loading.set(false);
    }, 2000);
  }
};

export const schedulesRefresh = writable(0);

export const loading = writable(false);
export const serverError = writable('');
export const schedulesCount = writable({
  count: 0,
  newCount: 0,
});
