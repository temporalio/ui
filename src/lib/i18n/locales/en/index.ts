import * as Activities from './activities';
import * as Batch from './batch';
import * as CodecServer from './codec-server';
import * as Common from './common';
import * as DataEncoder from './data-encoder';
import * as DatePicker from './date-picker';
import * as Deployments from './deployments';
import * as Events from './events';
import * as Namespaces from './namespaces';
import * as Nexus from './nexus';
import * as Schedules from './schedules';
import * as SearchAttributes from './search-attributes';
import * as StandaloneActivities from './standalone-activities';
import * as TypedErrors from './typed-errors';
import * as Workers from './workers';
import * as Workflows from './workflows';

export const EN = 'en' as const;

export const English = {
  [Activities.Namespace]: Activities.Strings,
  [Batch.Namespace]: Batch.Strings,
  [CodecServer.Namespace]: CodecServer.Strings,
  [Common.Namespace]: Common.Strings,
  [DatePicker.Namespace]: DatePicker.Strings,
  [Deployments.Namespace]: Deployments.Strings,
  [Workflows.Namespace]: Workflows.Strings,
  [TypedErrors.Namespace]: TypedErrors.Strings,
  [Events.Namespace]: Events.Strings,
  [Schedules.Namespace]: Schedules.Strings,
  [DataEncoder.Namespace]: DataEncoder.Strings,
  [Namespaces.Namespace]: Namespaces.Strings,
  [Nexus.Namespace]: Nexus.Strings,
  [SearchAttributes.Namespace]: SearchAttributes.Strings,
  [StandaloneActivities.Namespace]: StandaloneActivities.Strings,
  [Workers.Namespace]: Workers.Strings,
} as const;
