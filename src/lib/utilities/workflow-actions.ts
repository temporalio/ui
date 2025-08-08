import { translate } from '$lib/i18n/translate';
import { Action } from '$lib/models/workflow-actions';

function unhandledAction(action: never) {
  console.error('Unhandled action:', action);
}

export const getPlaceholder = (action: Action, identity?: string): string => {
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

  return identity
    ? translate('workflows.workflow-action-reason-placeholder-with-identity', {
        action: translatedAction,
        identity,
      })
    : translate('workflows.workflow-action-reason-placeholder', {
        action: translatedAction,
      });
};

export const formatReason = ({
  action,
  reason,
  identity,
}: {
  action: Action;
  reason: string;
  identity?: string;
}) => {
  const placeholder = getPlaceholder(action, identity);
  return reason ? [reason.trim(), placeholder].join(' ') : placeholder;
};
