import {
  createToaster,
  type CreateToasterProps,
  type CreateToasterReturn,
} from '@ark-ui/svelte/toast';

export type IoToaster = CreateToasterReturn;
export type IoToasterOptions = Partial<CreateToasterProps>;

type ToastData = Parameters<IoToaster['create']>[0];
type PromiseOptions = Parameters<IoToaster['promise']>[1];

export const persistToastWithAction = <
  T extends { action?: unknown; duration?: number },
>(
  data: T,
): T =>
  data.action && data.duration === undefined
    ? { ...data, duration: Infinity }
    : data;

const persistResult = <T>(result: T): T =>
  typeof result === 'function'
    ? (((...args: unknown[]) => persistToastWithAction(result(...args))) as T)
    : result && typeof result === 'object'
      ? persistToastWithAction(result)
      : result;

export const createIoToaster = (options: IoToasterOptions = {}): IoToaster => {
  const toaster = createToaster({
    placement: 'bottom-end',
    max: 5,
    gap: 12,
    overlap: false,
    duration: 5000,
    pauseOnPageIdle: true,
    ...options,
  });

  const wrap =
    (create: (data: ToastData) => string | void) => (data: ToastData) =>
      create(persistToastWithAction(data));

  return Object.assign(toaster, {
    create: wrap(toaster.create) as IoToaster['create'],
    success: wrap(toaster.success) as IoToaster['success'],
    error: wrap(toaster.error) as IoToaster['error'],
    warning: wrap(toaster.warning) as IoToaster['warning'],
    info: wrap(toaster.info) as IoToaster['info'],
    loading: wrap(toaster.loading) as IoToaster['loading'],
    update: ((id, data) =>
      toaster.update(id, persistToastWithAction(data))) as IoToaster['update'],
    promise: ((promise, promiseOptions: PromiseOptions, shared) =>
      toaster.promise(
        promise,
        {
          ...promiseOptions,
          success: persistResult(promiseOptions.success),
          error: persistResult(promiseOptions.error),
        },
        shared,
      )) as IoToaster['promise'],
  });
};

export const toaster = createIoToaster();
