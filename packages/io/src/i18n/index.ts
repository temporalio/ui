import { getContext, hasContext, setContext } from 'svelte';

export type IoTranslationKey =
  | 'common.breadcrumbs'
  | 'workflows.running'
  | 'workflows.paused'
  | 'workflows.completed'
  | 'workflows.continued-as-new'
  | 'workflows.failed'
  | 'workflows.timed-out'
  | 'workflows.terminated'
  | 'workflows.canceled';

export type IoTranslate = (key: IoTranslationKey) => string;

export const ioDefaultTranslations: Record<IoTranslationKey, string> = {
  'common.breadcrumbs': 'Breadcrumbs',
  'workflows.running': 'Running',
  'workflows.paused': 'Paused',
  'workflows.completed': 'Completed',
  'workflows.continued-as-new': 'Continued as New',
  'workflows.failed': 'Failed',
  'workflows.timed-out': 'Timed Out',
  'workflows.terminated': 'Terminated',
  'workflows.canceled': 'Canceled',
};

const ioTranslateKey = Symbol.for('@temporalio/io:translate');

const defaultTranslate: IoTranslate = (key) => ioDefaultTranslations[key];

export const setIoTranslate = (translate: IoTranslate): IoTranslate =>
  setContext(ioTranslateKey, translate);

export const getIoTranslate = (): IoTranslate =>
  hasContext(ioTranslateKey)
    ? getContext<IoTranslate>(ioTranslateKey)
    : defaultTranslate;
