import { translate } from '$lib/i18n/translate';
import { Action } from '$lib/models/workflow-actions';

type PastActionText = 'terminated' | 'reset' | 'canceled';

function unhandledAction(action: never) {
  console.error('Unhandled action:', action);
}

const getPastTenseActionText = (action: Action): PastActionText => {
  switch (action) {
    case Action.Cancel:
      return 'canceled';
    case Action.Reset:
      return 'reset';
    case Action.Terminate:
      return 'terminated';
    default:
      unhandledAction(action);
  }
};

export const getPlacholder = (action: Action, email?: string): string => {
  const translatedAction = translate(
    'workflows',
    getPastTenseActionText(action),
  );

  return email
    ? translate('workflows', 'workflow-action-reason-placeholder-with-email', {
        action: translatedAction,
        email,
      })
    : translate('workflows', 'workflow-action-reason-placeholder', {
        action: translatedAction,
      });
};

export const formatReason = ({
  action,
  reason,
  email,
}: {
  action: Action;
  reason: string;
  email?: string;
}) => {
  const placeholder = getPlacholder(action, email);
  return reason ? [reason.trim(), placeholder].join(' ') : placeholder;
};
