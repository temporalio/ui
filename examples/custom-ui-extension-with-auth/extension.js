const PROTOCOL_VERSION = 1;
const HELLO_RETRY_INTERVAL_MS = 1_000;
const MAX_HELLO_ATTEMPTS = 10;
const COMPACT_HEIGHT = 120;
const EXPANDED_HEIGHT = 220;

const knownPermissions = new Set([
  'context:route',
  'context:namespace',
  'context:workflow',
  'navigation:write',
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
const accountValue = requiredElement('#account-value');
const tokenValue = requiredElement('#token-value');
const signInButton = requiredElement('#sign-in-button');
const signOutButton = requiredElement('#sign-out-button');
const devicePanel = requiredElement('#device-panel');
const userCode = requiredElement('#user-code');
const verificationUri = requiredElement('#verification-uri');
const deviceStatus = requiredElement('#device-status');
const actionStatus = requiredElement('#action-status');

let parentOrigin;
let extensionId;
let instanceId;
let helloAttempts = 0;
let helloTimer;

// The iframe has an opaque origin, so there is no storage to persist this in.
// The handle lives in memory only and a reload signs the user out.
let sessionId;
let pendingId;
let pollTimer;
let countdownTimer;
let tokenExpiresIn = 0;
let refreshing = false;

const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const boundedString = (value, maximumLength = 160) => {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, maximumLength);
};

const setConnectionStatus = (message, state) => {
  connectionStatus.textContent = message;
  connectionStatus.dataset.state = state;
};

const setActionStatus = (message) => {
  actionStatus.textContent = message;
};

const postToParent = (message) => {
  if (!parentOrigin || window.parent === window) return;
  window.parent.postMessage(message, parentOrigin);
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
  }
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

  instanceId = message.instanceId;
  window.clearInterval(helloTimer);
  helloTimer = undefined;
  setConnectionStatus('Connected', 'connected');
  sendWithInstance('temporal-extension/ready');
  requestHeight(devicePanel.hidden ? COMPACT_HEIGHT : EXPANDED_HEIGHT);
};

const acceptTheme = (message) => {
  if (!['light', 'dark'].includes(message.theme)) return;
  document.documentElement.dataset.theme = message.theme;
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
  }
};

const callApi = async (path, { method = 'GET', body } = {}) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (sessionId) headers.Authorization = `Bearer ${sessionId}`;

  // Relative URLs resolve against the document URL, so these reach the
  // extension's own backend even though `location.origin` reports "null".
  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok && !isRecord(payload)) {
    throw new Error(`Request to ${path} failed with ${response.status}`);
  }
  return { ok: response.ok, status: response.status, payload };
};

const stopPolling = () => {
  window.clearTimeout(pollTimer);
  pollTimer = undefined;
  pendingId = undefined;
};

const stopCountdown = () => {
  window.clearInterval(countdownTimer);
  countdownTimer = undefined;
};

const showDevicePanel = (visible) => {
  devicePanel.hidden = !visible;
  requestHeight(visible ? EXPANDED_HEIGHT : COMPACT_HEIGHT);
};

const renderSignedOut = (message) => {
  stopPolling();
  stopCountdown();
  sessionId = undefined;
  accountValue.textContent = 'Not signed in';
  tokenValue.textContent = 'None';
  signInButton.hidden = false;
  signInButton.disabled = false;
  signInButton.textContent = 'Sign in';
  signOutButton.hidden = true;
  showDevicePanel(false);
  if (message) setActionStatus(message);
};

const renderTokenValue = () => {
  if (!sessionId) return;
  tokenValue.textContent = refreshing
    ? 'Refreshing…'
    : `Expires in ${Math.max(0, tokenExpiresIn)}s`;
};

const refreshSession = async () => {
  if (!sessionId || refreshing) return;

  refreshing = true;
  renderTokenValue();

  try {
    const { ok, payload } = await callApi('/api/session');
    if (!ok) {
      renderSignedOut('The extension session ended. Sign in again.');
      return;
    }
    tokenExpiresIn = Number(payload.accessTokenExpiresInSeconds) || 0;
    if (payload.refreshed) {
      setActionStatus(
        `Access token refreshed (${payload.refreshCount} so far).`,
      );
    }
  } catch {
    renderSignedOut('Lost contact with the extension backend.');
    return;
  } finally {
    refreshing = false;
  }

  renderTokenValue();
};

const startCountdown = () => {
  stopCountdown();
  countdownTimer = window.setInterval(() => {
    tokenExpiresIn -= 1;
    renderTokenValue();
    // The sample provider issues 60 second access tokens. Asking the backend
    // for the session once the token lapses exercises the refresh grant.
    if (tokenExpiresIn <= 0) void refreshSession();
  }, 1_000);
};

const renderSignedIn = (payload) => {
  stopPolling();
  sessionId = boundedString(payload.sessionId, 256);

  const claims = isRecord(payload.claims) ? payload.claims : {};
  accountValue.textContent =
    boundedString(claims.name) ||
    boundedString(claims.email) ||
    boundedString(claims.preferredUsername) ||
    boundedString(claims.sub) ||
    'Unknown user';
  accountValue.title = boundedString(claims.email) || '';

  tokenExpiresIn = Number(payload.accessTokenExpiresInSeconds) || 0;
  renderTokenValue();
  startCountdown();

  signInButton.hidden = true;
  signOutButton.hidden = false;
  showDevicePanel(false);
  setActionStatus('Signed in to the extension.');
};

const scheduleNextPoll = (seconds) => {
  pollTimer = window.setTimeout(
    () => void pollForCompletion(seconds),
    seconds * 1_000,
  );
};

async function pollForCompletion(intervalSeconds) {
  if (!pendingId) return;

  let result;
  try {
    result = await callApi('/api/session/poll', {
      method: 'POST',
      body: { pendingId },
    });
  } catch {
    renderSignedOut('Lost contact with the extension backend.');
    return;
  }

  const payload = result.payload;

  if (payload.status === 'complete') {
    renderSignedIn(payload);
    return;
  }

  if (payload.status === 'pending') {
    const nextInterval =
      intervalSeconds + (Number(payload.slowDownBySeconds) || 0);
    scheduleNextPoll(nextInterval);
    return;
  }

  if (payload.status === 'denied') {
    renderSignedOut('Authorization was denied at the identity provider.');
    return;
  }

  if (payload.status === 'expired') {
    renderSignedOut('The sign-in code expired. Start again.');
    return;
  }

  renderSignedOut(
    boundedString(payload.message) ||
      boundedString(payload.error) ||
      'Sign-in failed.',
  );
}

const beginSignIn = async () => {
  signInButton.disabled = true;
  signInButton.textContent = 'Starting…';
  setActionStatus('Requesting a device code from the identity provider.');

  let result;
  try {
    result = await callApi('/api/session/start', { method: 'POST' });
  } catch {
    renderSignedOut('Could not reach the extension backend.');
    return;
  }

  if (!result.ok) {
    renderSignedOut(
      boundedString(result.payload.error) ||
        'Could not start sign-in. Is the identity provider running?',
    );
    return;
  }

  const payload = result.payload;
  pendingId = boundedString(payload.pendingId, 256);
  userCode.textContent = boundedString(payload.userCode, 64) || '—';
  verificationUri.textContent =
    boundedString(payload.verificationUri, 256) || '—';
  deviceStatus.textContent = 'Waiting for approval…';

  signInButton.hidden = true;
  showDevicePanel(true);
  setActionStatus(
    'Enter the code at the verification URL to finish signing in.',
  );

  const intervalSeconds = Number(payload.intervalSeconds) || 5;
  scheduleNextPoll(intervalSeconds);
};

const signOut = async () => {
  signOutButton.disabled = true;
  try {
    await callApi('/api/session/logout', { method: 'POST' });
  } catch {
    // Clearing local state is what matters for the demo.
  }
  signOutButton.disabled = false;
  renderSignedOut('Signed out and revoked the tokens.');
};

signInButton.addEventListener('click', () => void beginSignIn());
signOutButton.addEventListener('click', () => void signOut());

try {
  parentOrigin = parseParentOrigin(metaContent('temporal-ui-origin'));
  extensionId = parseExtensionId(metaContent('temporal-extension-id'));

  renderSignedOut();

  if (window.parent === window) {
    setConnectionStatus('Not embedded', 'warning');
    setActionStatus(
      'Open this page through its configured Temporal UI slot. Sign-in still works here.',
    );
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
  stopPolling();
  stopCountdown();
});
