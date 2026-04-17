export type CommonErrorSeverity = 'error' | 'warning' | 'info';

export type CommonErrorCategory =
  | 'workflow-timeouts'
  | 'continue-as-new'
  | 'retry-policies'
  | 'activity-timeouts'
  | 'heartbeat'
  | 'delayed-start'
  | 'local-activities'
  | 'event-history'
  | 'multiple-payloads'
  | 'workflow-id-reuse'
  | 'memo-headers';

export interface CommonError {
  id: number;
  severity: CommonErrorSeverity;
  title: string;
  description: string;
  link: string;
  action: string;
  category: CommonErrorCategory;
  cloudOnly?: boolean;
}
