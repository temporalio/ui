import { translate } from '$lib/i18n/translate';
import { Action } from '$lib/models/workflow-actions';

function unhandledAction(action: never) {
  console.error('Unhandled action:', action);
}

export const getPlacholder = (action: Action, email?: string): string => {
  let translatedAction: string;
  switch (action) {
    case Action.Cancel:
      translatedAction = translate('workflows.canceled');
      break;
    case Action.Reset:
      translatedAction = translate('workflows.reset');
      break;
    case Action.Terminate:
      translatedAction = translate('workflows.terminated');
      break;
    default:
      unhandledAction(action);
  }

  return email
    ? translate('workflows.workflow-action-reason-placeholder-with-email', {
        action: translatedAction,
        email,
      })
    : translate('workflows.workflow-action-reason-placeholder', {
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
