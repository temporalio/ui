const SCREAMING_SNAKE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/;

const toScreamingSnake = (key: string): string =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

/**
 * An enum value written the way the API spells it, `TASK_QUEUE_KIND_NORMAL`,
 * read as words. The field's own name is the enum's prefix, so it is dropped:
 * a "Task queue kind" of `TASK_QUEUE_KIND_NORMAL` is just "Normal". Anything
 * that isn't an enum value comes back unchanged.
 */
export const humanizeEnumValue = (key: string, value: unknown): string => {
  const text = String(value);
  if (!SCREAMING_SNAKE.test(text)) return text;
  const prefix = `${toScreamingSnake(key)}_`;
  const at = text.lastIndexOf(prefix);
  const rest = at >= 0 ? text.slice(at + prefix.length) : text;
  if (!rest) return text;
  const words = rest.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const CONFIGURATION_FIELD =
  /(Timeout|Policy|Kind|EventId|BuildId|Interval|Coefficient|MaximumAttempts)$|^(retryPolicy|priority|header|cronSchedule|namespaceId)/;

/**
 * Fields that set an event up rather than say what happened in it: timeouts,
 * policies, retry settings, internal event references. They're rarely what
 * someone opens an event for, so they can wait behind a disclosure.
 */
export const isConfigurationField = (key: string): boolean =>
  CONFIGURATION_FIELD.test(key);
