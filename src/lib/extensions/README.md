# Temporal UI iframe extensions

Temporal UI iframe extensions let operators place customer-owned UI in a small
set of stable locations without loading customer JavaScript into the Temporal UI
document.

The iframe boundary is intentional. Extension code never receives Temporal
access tokens, ID tokens, cookies, or direct access to the parent DOM. Context
and host actions are granted explicitly through a versioned `postMessage`
protocol.

## Security model

Production extensions that receive context or request navigation must:

- be hosted on a dedicated HTTPS origin that is different from the Temporal UI
  origin;
- configure that exact origin as `allowedOrigin`;
- set `sandbox.allowSameOrigin: true`, which lets the host validate the real
  message origin while the remaining sandbox restrictions stay active;
- return a `Content-Security-Policy` with a `frame-ancestors` directive that
  names the Temporal UI origin;
- validate the Temporal UI origin and `event.source === window.parent` before
  accepting host messages.

Do not host customer-controlled JavaScript on the Temporal UI origin. A sandbox
applies only while a page is embedded; the same page opened directly would run
without the iframe sandbox on the origin that owns the Temporal UI session.
Consequently, same-origin extensions are rejected when UI authentication is
enabled.

An extension without permissions may use an opaque sandbox. It receives theme
and viewport information, but no route, namespace, or workflow context. HTTP is
accepted only for loopback development origins and never for a privileged
extension.

The iframe sandbox limits what extension code can do to Temporal UI. It does not
prevent an extension from sending context it has been granted to its own
backend. Context permissions are therefore operator trust decisions, not data
loss prevention controls.

The public UI document's `frame-src` CSP names configured extension origins, so
origin hostnames are visible before login. Full definitions remain behind the
registry authorization check, but origin names must not be treated as secrets.

## Runtime flow

1. Public UI settings expose only whether custom UI is enabled.
2. After the user is authorized, Temporal UI fetches the extension definitions
   from `GET /api/v1/ui-extensions`. When authentication is enabled, the server
   verifies the request through the configured Temporal API authentication and
   authorization path before returning the registry.
3. The host selects definitions for the current typed slot and route.
4. It verifies the source, origin, permission, and layout contract.
5. The iframe loads with sandbox, referrer, and Permissions Policy restrictions.
6. The host creates a new random `instanceId` and sends `temporal-ui/welcome`.
7. The extension echoes that ID in `temporal-extension/ready`.
8. Only then does the host send granted context, theme, and viewport updates.

The `instanceId` changes after every iframe load. Messages for an older document
are ignored.

## Run the example extension

The repository includes a complete extension under
`examples/custom-ui-extension`. It uses the real handshake and shows the host
theme, viewport, granted permissions, and connection status. It can also
request bounded resizes. Start the extension and Temporal UI in separate
terminals:

```sh
# Terminal 1: extension origin (http://127.0.0.1:8090)
pnpm dev:extension-example
```

```sh
# Terminal 2: Temporal, UI Server, and Temporal UI
pnpm dev:ui-server:extension-example
```

Open `http://localhost:3000`. The example appears in the sub-navigation slot on
every application route. Its standalone URL is `http://127.0.0.1:8090`; when
opened directly it reports `Not embedded` because there is no Temporal UI parent
to complete the handshake.

The opt-in command enables the example block in
`server/config/development.yaml`. Normal development leaves it disabled. The
example runs on a separate loopback origin and the example server returns a
`frame-ancestors http://localhost:3000` CSP. Keep both origins exact; opening
Temporal UI as `http://127.0.0.1:3000` is intentionally not equivalent.

Local HTTP extensions cannot receive context or navigation grants. This demo
therefore exercises the safe, unprivileged surface: mounting, handshake, theme,
viewport, and resize. To exercise context or navigation, deploy the same
example to a dedicated HTTPS origin, add the deployed Temporal UI origin to the
extension's host allowlist and `frame-ancestors` policy, then use the privileged
configuration below.

For a disposable mount-only check without running the example server,
`https://example.com/` can be configured as an unprivileged iframe. It does not
implement the Temporal extension protocol, so it cannot prove handshake,
theming, resizing, context, or navigation behavior and should not be an
automated-test dependency.

## Configuration

```yaml
customUi:
  enabled: true
  iframeExtensions:
    - id: workflow-operations
      title: Workflow operations
      slot: workflow.header.after-details
      src: https://temporal-extensions.example.com/workflow-operations
      allowedOrigin: https://temporal-extensions.example.com
      routePatterns:
        - /namespaces/:namespace/workflows/:workflow/:run/*
      sandbox:
        allowSameOrigin: true
      sizing:
        defaultHeight: 160
        minHeight: 96
        maxHeight: 480
      permissions:
        - context:namespace
        - context:workflow
```

Configuration is validated when it is loaded. Invalid or duplicate IDs,
unsupported slots or permissions, unsafe URLs, mismatched origins, malformed
route patterns, incompatible sandbox settings, excessive extension counts, and
invalid dimensions reject the configuration instead of silently hiding an
extension.

`customUi.enabled: false` is an emergency kill switch. While disabled,
definitions are neither validated nor returned, and their origins are omitted
from the iframe CSP allowlist.

### Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Unique stable ID using letters, digits, `.`, `_`, or `-`. |
| `title` | No | Accessible iframe title; defaults to `id`. |
| `slot` | Yes | One of the typed slots below. |
| `src` | Yes | Absolute HTTPS entrypoint for production extensions. |
| `allowedOrigin` | Yes | Exact origin of `src`; wildcards are rejected. |
| `routePatterns` | No | Base-path-independent routes on which the extension appears. |
| `sandbox` | No | Explicit sandbox capabilities. `allow-scripts` is always present. |
| `sizing` | No | Initial dimensions and extension-requested resize bounds. |
| `permissions` | No | Explicit context or host-action grants. |

## Slots and layout limits

The host owns layout. Configuration and resize messages can narrow these bounds
but cannot exceed them.

| Slot | Default size | Hard limits | Maximum |
| --- | --- | --- | ---: |
| `app.top-nav.actions.before` | 160×32 px | 320×40 px | 2 |
| `app.top-nav.actions.after` | 160×32 px | 320×40 px | 2 |
| `app.top-nav.sub-nav` | 100%×48 px | 1200×240 px when fixed | 2 |
| `workflow.header.after-details` | 100%×160 px | 1200×640 px when fixed | 4 |

Leave `defaultWidth` unset for a fluid block extension. It fills 100% of its
slot container without requiring `maxWidth`; optional width bounds apply only
after configuring or requesting a fixed pixel width.

The two top-navigation action slots are desktop-only. The sub-navigation and
workflow block slots can render at mobile widths; a future contribution API
will support host-rendered mobile navigation.

## Route patterns and public paths

Patterns are written against the application path without the configured UI
public path:

```yaml
routePatterns:
  - /namespaces/:namespace/workflows
  - /namespaces/:namespace/workflows/:workflow/:run/*
```

A terminal `/*` also matches the corresponding route without a trailing
segment. Temporal UI removes its configured base path before matching.

For the limited same-origin, unauthenticated development mode, a root-relative
`src` is resolved beneath the Temporal UI base path. Production entrypoints must
be absolute HTTPS URLs.

## Permissions

Permissions default to none:

| Permission | Effect |
| --- | --- |
| `context:route` | Sends raw application pathname, search string, and route parameters. These can contain workflow identifiers or user-entered queries. |
| `context:namespace` | Sends the active namespace. |
| `context:workflow` | Sends workflow ID, run ID, status, task queue, and workflow type when available. |
| `navigation:write` | Accepts navigation requests to approved Temporal UI application routes under the configured base path. |

Any permission makes an extension privileged, requiring a dedicated HTTPS
origin and `allowSameOrigin: true`. Granting `context:workflow` does not
implicitly grant the raw route or query string.

The origin—not an individual URL path or iframe—is the browser security
principal. Pages on the same extension origin can share storage, workers, and
messaging. Treat every permission granted to one extension as available to all
code hosted on that origin, and use separate origins for different trust or
permission boundaries.

Host-provided context is display data, not an authentication credential. An
extension backend must use its own session or an operator-controlled,
audience-restricted credential.

## Sandbox and browser capabilities

Every iframe has `allow-scripts`. Operators may additionally enable:

| Configuration | Sandbox token |
| --- | --- |
| `allowDownloads` | `allow-downloads` |
| `allowForms` | `allow-forms` |
| `allowModals` | `allow-modals` |
| `allowPopups` | `allow-popups` |
| `allowSameOrigin` | `allow-same-origin` |

`allow-popups-to-escape-sandbox` is intentionally unsupported. External URLs
should be normal links inside the sandbox or, in a future protocol version, a
host-mediated action.

The host also sets `referrerPolicy="no-referrer"` and denies powerful delegated
browser features such as camera, microphone, geolocation, payment, USB, and
screen capture through the iframe Permissions Policy.

## Message protocol

Every message contains:

```ts
{
  version: 1;
  extensionId: string;
}
```

All messages after `hello` also contain the current random `instanceId`.

### Handshake

An extension may send `hello` whenever it needs the current welcome message:

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/hello',
    version: 1,
    extensionId: 'workflow-operations',
  },
  '*',
);
```

`hello` contains no sensitive information. The host validates the iframe window
and configured origin, then responds:

```ts
{
  type: 'temporal-ui/welcome',
  version: 1,
  extensionId: 'workflow-operations',
  instanceId: 'random-per-load-id',
  permissions: ['context:namespace', 'context:workflow']
}
```

After validating the host origin and message source, echo `instanceId` in
`ready`. Context is not sent before this acknowledgement.

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/ready',
    version: 1,
    extensionId: 'workflow-operations',
    instanceId,
  },
  temporalUiOrigin,
);
```

### Host messages

- `temporal-ui/context` contains only the fields granted by permissions.
- `temporal-ui/theme` contains `theme: 'light' | 'dark'`.
- `temporal-ui/viewport` contains the slot name and current host-owned width and
  height.

Each host message includes `version`, `extensionId`, and `instanceId`.

### Extension messages

Resize requests are RAF-coalesced and clamped to both the configured bounds and
the hard slot policy:

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/resize',
    version: 1,
    extensionId: 'workflow-operations',
    instanceId,
    height: document.documentElement.scrollHeight,
  },
  temporalUiOrigin,
);
```

Internal navigation additionally requires `navigation:write`:

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/navigate',
    version: 1,
    extensionId: 'workflow-operations',
    instanceId,
    href: '/namespaces/default/workflows',
  },
  temporalUiOrigin,
);
```

Navigation is restricted to Temporal UI application roots under its configured
base path. API, authentication, asset, unrelated same-origin, and external URLs
are rejected.

## Minimal extension listener

Put the listener in an external script so it remains compatible with a strict
`default-src 'self'` Content Security Policy. The checked-in example contains a
more complete implementation.

```js
const extensionId = 'workflow-operations';
const allowedTemporalUiOrigins = new Set(['https://temporal.example.com']);
let instanceId;
let temporalUiOrigin;

const send = (type, values = {}) => {
  if (!instanceId || !temporalUiOrigin) return;
  window.parent.postMessage(
    { type, version: 1, extensionId, instanceId, ...values },
    temporalUiOrigin,
  );
};

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  if (!allowedTemporalUiOrigins.has(event.origin)) return;
  if (event.data?.version !== 1) return;
  if (event.data?.extensionId !== extensionId) return;

  if (event.data.type === 'temporal-ui/welcome') {
    if (typeof event.data.instanceId !== 'string' || !event.data.instanceId) {
      return;
    }
    temporalUiOrigin = event.origin;
    instanceId = event.data.instanceId;
    send('temporal-extension/ready');
    return;
  }

  if (event.data.instanceId !== instanceId) return;

  if (event.data.type === 'temporal-ui/theme') {
    document.documentElement.dataset.theme = event.data.theme;
  }

  if (event.data.type === 'temporal-ui/context') {
    // Render from the explicitly granted context using textContent.
  }
});

window.parent.postMessage(
  { type: 'temporal-extension/hello', version: 1, extensionId },
  '*',
);
```

The extension server should also return a policy similar to:

```http
Content-Security-Policy: default-src 'self'; frame-ancestors https://temporal.example.com
```

Define a suitably narrow `connect-src`, `img-src`, and other directives for the
extension itself.

## Adding a slot inside Temporal UI

Slots are a public contract. Add the slot name and layout policy to the typed
registry, add matching server validation, render `ExtensionSlot` in a stable
location, and add browser coverage for disabled, desktop, mobile, and maximum
layout behavior. Do not accept an arbitrary string-only slot.

## Testing and troubleshooting

If an extension does not render, check:

- the server configuration validation error;
- that authentication has completed before `/api/v1/ui-extensions` is fetched;
- the exact `src` and `allowedOrigin` origins;
- HTTPS and `allowSameOrigin: true` for every permissioned extension;
- the extension response's CSP `frame-ancestors` and `X-Frame-Options` headers;
- the base-path-independent route pattern;
- the browser console for CSP or iframe errors.

If messages are ignored, check the message source, both exact origins, version,
extension ID, current instance ID, ready state, and configured permission.

Relevant implementation files:

- `server/server/config/custom_ui.go`
- `server/server/api/handler.go`
- `src/lib/components/extensions/`
- `src/lib/extensions/iframe-extensions.ts`
- `src/lib/extensions/messages.ts`
- `src/lib/extensions/types.ts`
