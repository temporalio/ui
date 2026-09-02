import type { IconComponent } from '../icon';

export type BadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'accent';

export type BadgeExtension = {
  text?: string;
  LeadIcon?: IconComponent;
  TrailIcon?: IconComponent;
};

export type StatusBadgeStatus =
  | 'Running'
  | 'Paused'
  | 'Completed'
  | 'ContinuedAsNew'
  | 'Failed'
  | 'TimedOut'
  | 'Terminated'
  | 'Canceled';

export type CountBadgeType = 'count' | 'total';
export type CountBadgeVariant = 'neutral' | 'error';
export type TagBadgeVariant = Exclude<BadgeVariant, 'error'>;

export type TagBadgeExtension = {
  text: string;
  Icon?: IconComponent | null;
};

export type BadgeSegment = {
  LeadIcon?: IconComponent;
  TrailIcon?: IconComponent;
  text: string;
  class?: string;
};
