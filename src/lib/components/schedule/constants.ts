import { translate } from '$lib/i18n/translate';
import type { OverlapPolicy } from '$lib/types/schedule';

export const getOverlapPolicyContent = (): Record<
  Exclude<OverlapPolicy, 'Unspecified'>,
  { isDefault?: boolean; label: string; description: string }
> => ({
  Skip: {
    isDefault: true,
    label: translate('schedules.overlap-skip-label'),
    description: translate('schedules.overlap-skip-description'),
  },
  BufferOne: {
    label: translate('schedules.overlap-buffer-one-label'),
    description: translate('schedules.overlap-buffer-one-description'),
  },
  BufferAll: {
    label: translate('schedules.overlap-buffer-all-label'),
    description: translate('schedules.overlap-buffer-all-description'),
  },
  CancelOther: {
    label: translate('schedules.overlap-cancel-other-label'),
    description: translate('schedules.overlap-cancel-other-description'),
  },
  TerminateOther: {
    label: translate('schedules.overlap-terminate-other-label'),
    description: translate('schedules.overlap-terminate-other-description'),
  },
  AllowAll: {
    label: translate('schedules.overlap-allow-all-label'),
    description: translate('schedules.overlap-allow-all-description'),
  },
});
