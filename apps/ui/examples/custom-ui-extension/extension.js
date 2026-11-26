const PROTOCOL_VERSION = 1;
const HELLO_RETRY_INTERVAL_MS = 1_000;
const MAX_HELLO_ATTEMPTS = 10;
const COMPACT_HEIGHT = 112;
const EXPANDED_HEIGHT = 184;

const knownPermissions = new Set([
  'context:route',
  'context:namespace',
  'context:workflow',
  'navigation:write',
]);
const knownSlots = new Set([
  'app.top-nav.actions.before',
  'app.top-nav.actions.after',
  'app.top-nav.sub-nav',
  'workflow.header.after-details',
]);

const requiredElement = (selector) => {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
};

const metaContent = (name) => {
  const value = document
    .querySelector(`meta[name="${name}"]`)
    ?.getAttribute('content')
    ?.trim();

  if (!value) throw new Error(`Missing required ${name} metadata`);
  return value;
};

const parseParentOrigin = (value) => {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== value) {
    throw new Error('temporal-ui-origin must be an exact HTTP(S) origin');
  }
  return url.origin;
};

const parseExtensionId = (value) => {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)) {
    throw new Error('temporal-extension-id is invalid');
  }
  return value;
};

const connectionStatus = requiredElement('#connection-status');
const themeValue = requiredElement('#theme-value');
const viewportValue = requiredElement('#viewport-value');
const permissionValue = requiredElement('#permission-value');
const contextValue = requiredElement('#context-value');
const contextPanel = requiredElement('#context-panel');
const resizeButton = requiredElement('#resize-button');
const navigateButton = requiredElement('#navigate-button');
const actionStatus = requiredElement('#action-status');

let parentOrigin;
let extensionId;
let instanceId;
let helloAttempts = 0;
let helloTimer;
let expanded = false;
let permissions = new Set();
let currentContext;

const setConnectionStatus = (message, state) => {
  connectionStatus.textContent = message;
  connectionStatus.dataset.state = state;
};

const setActionStatus = (message) => {
  actionStatus.textContent = message;
};

const isRecord = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const boundedString = (value, maximumLength = 160) => {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, maximumLength);
};

const safeRouteParams = (value) => {
  if (!isRecord(value)) return undefined;

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 16)
      .flatMap(([key, entry]) => {
        const safeValue = boundedString(entry);
        return safeValue === undefined ? [] : [[key.slice(0, 80), safeValue]];
      }),
  );
};

const displayContext = (context) => {
  if (!isRecord(context)) return;

  const workflow =
    permissions.has('context:workflow') && isRecord(context.workflow)
      ? {
          workflowId: boundedString(context.workflow.workflowId),
          runId: boundedString(context.workflow.runId),
          status: boundedString(context.workflow.status),
          taskQueue: boundedString(context.workflow.taskQueue),
          workflowType: boundedString(context.workflow.workflowType),
        }
      : undefined;

  const route =
    permissions.has('context:route') && isRecord(context.route)
      ? {
          pathname: boundedString(context.route.pathname, 1_024),
          search: boundedString(context.route.search, 1_024),
          params: safeRouteParams(context.route.params),
        }
      : undefined;

  const safeContext = {
    uiVersion: boundedString(context.uiVersion),
    temporalVersion: boundedString(context.temporalVersion),
    basePath: boundedString(context.basePath, 1_024),
    namespace: permissions.has('context:namespace')
      ? boundedString(context.namespace)
      : undefined,
    route,
    workflow,
  };

  currentContext = safeContext;
  contextValue.textContent = JSON.stringify(safeContext, null, 2);
};

const updatePermissionState = () => {
  const contextPermissions = [...permissions].filter((permission) =>
    permission.startsWith('context:'),
  );

  permissionValue.textContent = contextPermissions.length
    ? `Granted: ${contextPermissions.join(', ')}`
    : 'No context permissions granted.';

  navigateButton.disabled = !instanceId || !permissions.has('navigation:write');
  navigateButton.title = navigateButton.disabled
    ? 'Grant navigation:write to enable this host action.'
    : 'Ask Temporal UI to navigate to its workflows page.';
};

const postToParent = (message) => {
  if (!parentOrigin || window.parent === window) return;
  window.parent.postMessage(message, parentOrigin);
};

const sendHello = () => {
  if (!parentOrigin || !extensionId || instanceId) return;

  helloAttempts += 1;
  postToParent({
    type: 'temporal-extension/hello',
    version: PROTOCOL_VERSION,
    extensionId,
  });

  if (helloAttempts >= MAX_HELLO_ATTEMPTS) {
    window.clearInterval(helloTimer);
    helloTimer = undefined;
    setConnectionStatus('No host response', 'warning');
    setActionStatus('Check the iframe origin, extension ID, and host console.');
  }
};

const sendWithInstance = (type, values = {}) => {
  if (!instanceId) return;
  postToParent({
    type,
    version: PROTOCOL_VERSION,
    extensionId,
    instanceId,
    ...values,
  });
};

const requestHeight = (height) => {
  sendWithInstance('temporal-extension/resize', { height });
};

const acceptWelcome = (message) => {
  if (
    typeof message.instanceId !== 'string' ||
    message.instanceId.length === 0 ||
    message.instanceId.length > 128 ||
    !Array.isArray(message.permissions) ||
    message.permissions.length > knownPermissions.size ||
    !message.permissions.every((permission) =>
      knownPermissions.has(permission),
    ) ||
    new Set(message.permissions).size !== message.permissions.length
  ) {
    return;
  }

  const isNewDocumentInstance = instanceId !== message.instanceId;
  instanceId = message.instanceId;
  permissions = new Set(message.permissions);

  window.clearInterval(helloTimer);
  helloTimer = undefined;
  setConnectionStatus('Connected', 'connected');
  setActionStatus('Handshake complete. Host state is now accepted.');
  resizeButton.disabled = false;
  updatePermissionState();

  if (isNewDocumentInstance) {
    currentContext = undefined;
    contextValue.textContent = [...permissions].some((permission) =>
      permission.startsWith('context:'),
    )
      ? 'Waiting for granted context.'
      : 'No context permissions were granted.';
    themeValue.textContent = 'Waiting for host';
    viewportValue.textContent = 'Waiting for host';
  }

  sendWithInstance('temporal-extension/ready');
};

const acceptTheme = (message) => {
  if (!['light', 'dark'].includes(message.theme)) return;
  document.documentElement.dataset.theme = message.theme;
  themeValue.textContent = message.theme;
};

const acceptViewport = (message) => {
  if (
    typeof message.width !== 'number' ||
    !Number.isFinite(message.width) ||
    message.width < 0 ||
    typeof message.height !== 'number' ||
    !Number.isFinite(message.height) ||
    message.height < 0 ||
    !knownSlots.has(message.slot)
  ) {
    return;
  }

  viewportValue.textContent = `${Math.round(message.width)} × ${Math.round(
    message.height,
  )} px`;
};

const handleHostMessage = (event) => {
  if (event.source !== window.parent || event.origin !== parentOrigin) return;
  if (!isRecord(event.data)) return;

  const message = event.data;
  if (
    message.version !== PROTOCOL_VERSION ||
    message.extensionId !== extensionId ||
    typeof message.type !== 'string'
  ) {
    return;
  }

  if (message.type === 'temporal-ui/welcome') {
    acceptWelcome(message);
    return;
  }

  if (!instanceId || message.instanceId !== instanceId) return;

  if (message.type === 'temporal-ui/theme') {
    acceptTheme(message);
    return;
  }

  if (message.type === 'temporal-ui/viewport') {
    acceptViewport(message);
    return;
  }

  if (message.type === 'temporal-ui/context') {
    displayContext(message.context);
  }
};

resizeButton.addEventListener('click', () => {
  if (!instanceId) return;

  expanded = !expanded;
  contextPanel.hidden = !expanded;
  resizeButton.textContent = expanded ? 'Hide context' : 'Show context';
  resizeButton.setAttribute('aria-expanded', String(expanded));
  requestHeight(expanded ? EXPANDED_HEIGHT : COMPACT_HEIGHT);
  setActionStatus(
    expanded
      ? 'Requested the expanded height from Temporal UI.'
      : 'Requested the compact height from Temporal UI.',
  );
});

navigateButton.addEventListener('click', () => {
  if (!instanceId || !permissions.has('navigation:write')) return;

  const namespace = currentContext?.namespace || 'default';
  sendWithInstance('temporal-extension/navigate', {
    href: `/namespaces/${encodeURIComponent(namespace)}/workflows`,
  });
  setActionStatus('Requested navigation through the Temporal UI host.');
});

try {
  parentOrigin = parseParentOrigin(metaContent('temporal-ui-origin'));
  extensionId = parseExtensionId(metaContent('temporal-extension-id'));

  if (window.parent === window) {
    setConnectionStatus('Not embedded', 'warning');
    setActionStatus('Open this page through its configured Temporal UI slot.');
  } else {
    window.addEventListener('message', handleHostMessage);
    sendHello();
    helloTimer = window.setInterval(sendHello, HELLO_RETRY_INTERVAL_MS);
  }
} catch (error) {
  setConnectionStatus('Invalid configuration', 'error');
  setActionStatus(error instanceof Error ? error.message : String(error));
}

window.addEventListener('pagehide', () => {
  window.clearInterval(helloTimer);
});
