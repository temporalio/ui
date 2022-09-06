import add from './svg/add.svelte';
import archives from './svg/archives.svelte';
import arrowUp from './svg/arrow-up.svelte';
import calendar from './svg/calendar.svelte';
import calendarPlus from './svg/calendar-plus.svelte';
import chart from './svg/chart.svelte';
import checkmark from './svg/checkmark.svelte';
import chevronDown from './svg/chevron-down.svelte';
import chevronLeft from './svg/chevron-left.svelte';
import chevronRight from './svg/chevron-right.svelte';
import chevronUp from './svg/chevron-up.svelte';
import clock from './svg/clock.svelte';
import close from './svg/close.svelte';
import cometSolid from './svg/comet-solid.svelte';
import comet from './svg/comet.svelte';
import compact from './svg/compact.svelte';
import converterDown from './svg/converter-down.svelte';
import converterUp from './svg/converter-up.svelte';
import copy from './svg/copy.svelte';
import download from './svg/download.svelte';
import error from './svg/error.svelte';
import feed from './svg/feed.svelte';
import feedbackCircle from './svg/feedback-circle.svelte';
import feedback from './svg/feedback.svelte';
import fileImport from './svg/file-import.svelte';
import fileUpload from './svg/file-upload.svelte';
import filter from './svg/filter.svelte';
import filterSolid from './svg/filter-solid.svelte';
import hyphen from './svg/hyphen.svelte';
import info from './svg/info.svelte';
import invertedCheckmark from './svg/inverted-checkmark.svelte';
import json from './svg/json.svelte';
import lock from './svg/lock.svelte';
import logout from './svg/logout.svelte';
import namespaceSwitcher from './svg/namespace-switcher.svelte';
import namespace from './svg/namespace.svelte';
import navCollapse from './svg/nav-collapse.svelte';
import navExpand from './svg/nav-expand.svelte';
import regions from './svg/regions.svelte';
import retention from './svg/retention.svelte';
import retry from './svg/retry.svelte';
import schedules from './svg/schedules.svelte';
import search from './svg/search.svelte';
import settings from './svg/settings.svelte';
import sliders from './svg/sliders.svelte';
import spinner from './svg/spinner.svelte';
import spinnerSolid from './svg/spinner-solid.svelte';
import upload from './svg/upload.svelte';
import usage from './svg/usage.svelte';
import verticalEllipsis from './svg/vertical-ellipsis.svelte';
import warning from './svg/warning.svelte';
import workflow from './svg/workflow.svelte';

export type IconName = keyof typeof icons;

export const icons = {
  add,
  archives,
  'arrow-up': arrowUp,
  calendar,
  'calendar-plus': calendarPlus,
  chart,
  checkmark,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'chevron-right': chevronRight,
  'chevron-up': chevronUp,
  clock,
  close,
  'comet-solid': cometSolid,
  comet,
  compact,
  'converter-down': converterDown,
  'converter-up': converterUp,
  copy,
  download,
  error,
  feed,
  'feedback-circle': feedbackCircle,
  feedback,
  'file-import': fileImport,
  'file-upload': fileUpload,
  filter,
  'filter-solid': filterSolid,
  hyphen,
  info,
  'inverted-checkmark': invertedCheckmark,
  json,
  lock,
  logout,
  'namespace-switcher': namespaceSwitcher,
  namespace,
  'nav-collapse': navCollapse,
  'nav-expand': navExpand,
  regions,
  retention,
  retry,
  schedules,
  search,
  settings,
  sliders,
  spinner,
  'spinner-solid': spinnerSolid,
  upload,
  usage,
  'vertical-ellipsis': verticalEllipsis,
  warning,
  workflow,
};
