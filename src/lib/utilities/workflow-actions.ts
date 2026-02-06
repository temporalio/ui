import { translate } from '$lib/i18n/translate';
import { Action } from '$lib/models/workflow-actions';

function unhandledAction(action: never) {
  console.error('Unhandled action:', action);
}

export const getPlaceholder = (
  action: Action,
  identity: string | undefined,
): string => {
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
    case Action.Pause:
      translatedAction = translate('workflows.paused');
      break;
    case Action.Unpause:
      translatedAction = translate('workflows.unpaused');
      break;
    case Action.Signal:
      translatedAction = translate('workflows.signaled');
      break;
    default:
      unhandledAction(action);
  }

  return translate('workflows.workflow-action-reason-placeholder', {
    action: translatedAction,
    identity: identity || translate('common.unknown'),
  });
};

export const formatReason = ({
  action,
  reason,
  identity,
}: {
  action: Action;
  reason: string;
  identity: string | undefined;
}) => {
  const placeholder = getPlaceholder(action, identity);
  return reason ? [reason.trim(), placeholder].join(' ') : placeholder;
};
