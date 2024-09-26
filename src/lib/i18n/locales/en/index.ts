import * as Batch from './batch';
import * as Common from './common';
import * as DataEncoder from './data-encoder';
import * as DatePicker from './date-picker';
import * as Events from './events';
import * as Namespaces from './namespaces';
import * as Nexus from './nexus';
import * as Schedules from './schedules';
import * as TypedErrors from './typed-errors';
import * as Workers from './workers';
import * as Workflows from './workflows';

export const EN = 'en' as const;

export const English = {
  [Batch.Namespace]: Batch.Strings,
  [Common.Namespace]: Common.Strings,
  [DatePicker.Namespace]: DatePicker.Strings,
  [Workflows.Namespace]: Workflows.Strings,
  [TypedErrors.Namespace]: TypedErrors.Strings,
  [Events.Namespace]: Events.Strings,
  [Schedules.Namespace]: Schedules.Strings,
  [DataEncoder.Namespace]: DataEncoder.Strings,
  [Namespaces.Namespace]: Namespaces.Strings,
  [Nexus.Namespace]: Nexus.Strings,
  [Workers.Namespace]: Workers.Strings,
} as const;
