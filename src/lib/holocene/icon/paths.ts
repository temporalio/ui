import add from './svg/add.svelte';
import archives from './svg/archives.svelte';
import arrowRight from './svg/arrow-right.svelte';
import arrowUp from './svg/arrow-up.svelte';
import ascending from './svg/ascending.svelte';
import book from './svg/book.svelte';
import bookmark from './svg/bookmark.svelte';
import calendarPlus from './svg/calendar-plus.svelte';
import canceled from './svg/canceled.svelte';
import chart from './svg/chart.svelte';
import checkmark from './svg/checkmark.svelte';
import chevronDown from './svg/chevron-down.svelte';
import chevronLeft from './svg/chevron-left.svelte';
import chevronRight from './svg/chevron-right.svelte';
import chevronSelectorVertical from './svg/chevron-selector-vertical.svelte';
import chevronUp from './svg/chevron-up.svelte';
import clock from './svg/clock.svelte';
import close from './svg/close.svelte';
import cometSolid from './svg/comet-solid.svelte';
import comet from './svg/comet.svelte';
import compact from './svg/compact.svelte';
import converterDown from './svg/converter-down.svelte';
import converterUp from './svg/converter-up.svelte';
import copy from './svg/copy.svelte';
import descending from './svg/descending.svelte';
import download from './svg/download.svelte';
import error from './svg/error.svelte';
import exit from './svg/exit.svelte';
import eyeHide from './svg/eye-hide.svelte';
import eyeShow from './svg/eye-show.svelte';
import feed from './svg/feed.svelte';
import feedbackCircle from './svg/feedback-circle.svelte';
import feedback from './svg/feedback.svelte';
import fileImport from './svg/file-import.svelte';
import fileUpload from './svg/file-upload.svelte';
import filterSolid from './svg/filter-solid.svelte';
import filter from './svg/filter.svelte';
import graph from './svg/graph.svelte';
import hyphen from './svg/hyphen.svelte';
import importIcon from './svg/import.svelte';
import info from './svg/info.svelte';
import invertedCheckmark from './svg/inverted-checkmark.svelte';
import json from './svg/json.svelte';
import lock from './svg/lock.svelte';
import logout from './svg/logout.svelte';
import namespaceSwitcher from './svg/namespace-switcher.svelte';
import namespace from './svg/namespace.svelte';
import pinFilled from './svg/pin-filled.svelte';
import pin from './svg/pin.svelte';
import regions from './svg/regions.svelte';
import relationship from './svg/relationship.svelte';
import retention from './svg/retention.svelte';
import retry from './svg/retry.svelte';
import rocketShip from './svg/rocket-ship.svelte';
import schedules from './svg/schedules.svelte';
import search from './svg/search.svelte';
import settings from './svg/settings.svelte';
import sliders from './svg/sliders.svelte';
import spinnerSolid from './svg/spinner-solid.svelte';
import spinner from './svg/spinner.svelte';
import starEmpty from './svg/star-empty.svelte';
import starFilled from './svg/star-filled.svelte';
import summary from './svg/summary.svelte';
import support from './svg/support.svelte';
import terminal from './svg/terminal.svelte';
import timeline from './svg/timeline.svelte';
import transcoderError from './svg/transcoder-error.svelte';
import transcoderOff from './svg/transcoder-off.svelte';
import transcoderOn from './svg/transcoder-on.svelte';
import trash from './svg/trash.svelte';
import tutorial from './svg/tutorial.svelte';
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
  'arrow-right': arrowRight,
  ascending,
  book,
  bookmark,
  'calendar-plus': calendarPlus,
  canceled,
  chart,
  checkmark,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'chevron-right': chevronRight,
  'chevron-up': chevronUp,
  'chevron-selector-vertical': chevronSelectorVertical,
  clock,
  close,
  'comet-solid': cometSolid,
  comet,
  compact,
  'converter-down': converterDown,
  'converter-up': converterUp,
  copy,
  descending,
  download,
  error,
  exit,
  'eye-hide': eyeHide,
  'eye-show': eyeShow,
  feed,
  'feedback-circle': feedbackCircle,
  feedback,
  'file-import': fileImport,
  'file-upload': fileUpload,
  filter,
  'filter-solid': filterSolid,
  graph,
  hyphen,
  import: importIcon,
  info,
  'inverted-checkmark': invertedCheckmark,
  json,
  lock,
  logout,
  'namespace-switcher': namespaceSwitcher,
  namespace,
  'pin-filled': pinFilled,
  pin,
  regions,
  relationship,
  retention,
  retry,
  'rocket-ship': rocketShip,
  schedules,
  search,
  settings,
  sliders,
  spinner,
  'star-empty': starEmpty,
  'star-filled': starFilled,
  summary,
  support,
  'spinner-solid': spinnerSolid,
  terminal,
  timeline,
  'transcoder-error': transcoderError,
  'transcoder-on': transcoderOn,
  'transcoder-off': transcoderOff,
  trash,
  tutorial,
  upload,
  usage,
  'vertical-ellipsis': verticalEllipsis,
  warning,
  workflow,
};
