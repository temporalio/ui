import {
  type IconComponent,
  IconExclamationCircle,
  IconInfo,
  IconWarning,
} from '$lib/io/icon';
import type {
  CommonError,
  CommonErrorSeverity,
} from '$lib/types/common-errors';

interface SeverityStyle {
  Icon: IconComponent;
  iconClass: string;
  borderClass: string;
  dotClass: string;
}

export const SEVERITY_ORDER: CommonErrorSeverity[] = [
  'error',
  'warning',
  'info',
];

export const severityStyles: Readonly<
  Record<CommonErrorSeverity, SeverityStyle>
> = {
  error: {
    Icon: IconExclamationCircle,
    iconClass: 'text-danger',
    borderClass: 'border-l-danger',
    dotClass: 'bg-border-danger',
  },
  warning: {
    Icon: IconWarning,
    iconClass: 'text-warning',
    borderClass: 'border-l-warning',
    dotClass: 'bg-border-warning',
  },
  info: {
    Icon: IconInfo,
    iconClass: 'text-information',
    borderClass: 'border-l-information',
    dotClass: 'bg-border-information',
  },
};

export function sortBySeverity(errors: CommonError[]): CommonError[] {
  return [...errors].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
}

export function countBySeverity(
  errors: CommonError[],
): { severity: CommonErrorSeverity; count: number }[] {
  return SEVERITY_ORDER.map((severity) => ({
    severity,
    count: errors.filter((error) => error.severity === severity).length,
  })).filter(({ count }) => count > 0);
}
