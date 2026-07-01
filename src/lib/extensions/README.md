# Temporal UI Extensions

Temporal UI extensions let operators mount customer-owned iframe content into
stable locations in the UI. Extensions are configured on the UI server, rendered
inside sandboxed iframes, and receive read-only page context through a small
versioned `postMessage` protocol.

Use extensions when you need to show environment-specific controls or context
near Temporal UI workflows without changing the main UI bundle. Common examples
include incident status widgets, internal runbooks, workflow telemetry panels,
approval links, support links, and namespace-specific shortcuts.

## How It Works

At runtime, Temporal UI:

1. Fetches UI settings from the server.
2. Reads `customUi.iframeExtensions` from those settings.
3. Finds every extension whose `slot` matches a mounted `ExtensionSlot`.
4. Filters extensions by the current route when `routePatterns` are configured.
5. Validates the iframe `src` and `allowedOrigin`.
6. Renders the extension in a sandboxed iframe.
7. Sends context and theme updates to the iframe with `postMessage`.
8. Accepts a small set of messages back from the iframe, such as resize and
   same-origin navigation requests.

Extensions do not run inside the Temporal UI JavaScript context. They are normal
HTML pages hosted either by Temporal UI itself, by a local development server,
or by a remote HTTPS origin.

## Quick Start

Create an HTML page for the extension. For local development, static files under
`static/` are served by Temporal UI and can be referenced by path:

```html
<!-- static/custom-ui-examples/status.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        margin: 0;
        overflow: hidden;
        font-family: system-ui, sans-serif;
      }

      button {
        height: 32px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: white;
      }

      [data-theme='dark'] button {
        border-color: #475569;
        background: #1e293b;
        color: white;
      }
    </style>
  </head>
  <body>
    <button type="button">Incident Status</button>

    <script>
      const extensionId = 'incident-status';
      let hostOrigin = '*';

      const send = (message) => {
        window.parent.postMessage(
          {
            version: 1,
            extensionId,
            ...message,
          },
          hostOrigin,
        );
      };

      window.addEventListener('message', (event) => {
        const message = event.data;
        if (!message || message.extensionId !== extensionId) return;

        hostOrigin = event.origin;

        if (message.type === 'temporal-ui/theme') {
          document.documentElement.dataset.theme = message.theme;
        }

        send({
          type: 'temporal-extension/resize',
          width: 180,
          height: 32,
        });
      });

      send({ type: 'temporal-extension/ready' });
    </script>
  </body>
</html>
```

Enable the extension in the server configuration:

```yaml
customUi:
  enabled: true
  iframeExtensions:
    - id: incident-status
      title: Incident Status
      slot: app.top-nav.actions.after
      src: /custom-ui-examples/status.html
      allowedOrigin: self
      sizing:
        defaultWidth: 180
        minWidth: 180
        maxWidth: 180
        defaultHeight: 32
        minHeight: 32
        maxHeight: 32
```

Start Temporal UI with that config and visit the app. The extension appears in
the top navigation after the built-in action controls.

## Configuration Reference

Extensions are configured under `customUi`:

```yaml
customUi:
  enabled: true
  iframeExtensions:
    - id: workflow-header-summary
      title: Workflow Metrics
      slot: workflow.header.after-details
      src: /custom-ui-examples/workflow-header.html
      allowedOrigin: self
      routePatterns:
        - /namespaces/:namespace/workflows/:workflow/:run/*
      sizing:
        defaultWidth: 400
        defaultHeight: 140
        minHeight: 96
        maxHeight: 480
      sandbox:
        allowForms: true
        allowPopups: true
      permissions:
        - context:workflow
```

| Field | Required | Description |
| --- | --- | --- |
| `customUi.enabled` | Yes | Enables or disables all configured iframe extensions. |
| `iframeExtensions[].id` | Yes | Stable extension identifier. Every message must include this exact value as `extensionId`. |
| `title` | No | Iframe title for accessibility. If omitted in the client mapping, the `id` is used as a fallback. |
| `slot` | Yes | Stable UI location where the extension should render. |
| `src` | Yes | Iframe URL. Relative URLs resolve against the Temporal UI origin. Absolute URLs must be HTTPS, except local HTTP development origins. |
| `allowedOrigin` | Yes | `self` for the current Temporal UI origin, or an explicit HTTPS origin such as `https://extensions.example.com`. Local HTTP origins are accepted for localhost development. |
| `routePatterns` | No | Optional route filters. If empty or omitted, the extension renders on every route where the slot exists. |
| `sizing` | No | Initial and allowed iframe dimensions. Height defaults to `160`; width defaults to `100%` unless `defaultWidth` is set. |
| `sandbox` | No | Optional iframe sandbox capabilities. `allow-scripts` is always included. |
| `permissions` | No | Optional capabilities such as `context:workflow`, `context:user`, and `navigation:write`. |

## Slots

The current UI mounts these extension slots:

| Slot | Location | Notes |
| --- | --- | --- |
| `app.top-nav.actions.before` | Desktop top navigation, before built-in action controls. | Useful for compact controls. |
| `app.top-nav.actions.after` | Desktop top navigation, after built-in action controls. | Useful for compact controls. |
| `app.top-nav.sub-nav` | Full-width row directly below the top navigation. | Useful for banners or secondary navigation. |
| `workflow.header.after-details` | Workflow execution header, immediately after the workflow details block. | Can receive workflow context when `context:workflow` is granted. |

Each slot renders a stable host element with a `data-temporal-extension-slot`
attribute. The workflow header slot also exposes:

```html
data-temporal-namespace
data-temporal-workflow-id
data-temporal-run-id
```

Those attributes are available on the host slot element for browser-extension
style integrations. Iframe extensions should prefer the `postMessage` context
protocol described below.

## Route Patterns

`routePatterns` limit an extension to matching Temporal UI routes. Patterns use
path-style parameters:

```yaml
routePatterns:
  - /namespaces/:namespace/workflows
  - /namespaces/:namespace/workflows/:workflow/:run/*
```

If a pattern ends in `/*`, Temporal UI also treats the same path without the
trailing wildcard as a match. For example, this pattern:

```txt
/namespaces/:namespace/workflows/:workflow/:run/*
```

matches both the workflow run root page and nested workflow run pages.

## URL And Origin Rules

Temporal UI validates extension URLs before rendering:

- `src` must resolve to an HTTPS URL, or to a local HTTP development URL such as
  `http://localhost`, `http://127.0.0.1`, or `http://[::1]`.
- Relative `src` values resolve against the current Temporal UI origin.
- `allowedOrigin: self` resolves to the current Temporal UI origin.
- Explicit `allowedOrigin` values must be HTTPS, except local HTTP development
  origins.
- Wildcard and empty origins are rejected.
- The resolved `src.origin` must exactly match the resolved `allowedOrigin`.

For a static file served by Temporal UI, use:

```yaml
src: /custom-ui-examples/status.html
allowedOrigin: self
```

For a remote extension, use:

```yaml
src: https://extensions.example.com/status.html
allowedOrigin: https://extensions.example.com
```

Some remote sites cannot be embedded because their own `X-Frame-Options` or
Content Security Policy `frame-ancestors` headers block iframes. In that case,
Temporal UI configuration is correct but the browser will still refuse to render
the page.

## Sandbox

Every extension iframe runs with `allow-scripts`. Other sandbox capabilities are
disabled unless explicitly configured:

```yaml
sandbox:
  allowDownloads: false
  allowForms: true
  allowModals: false
  allowPopups: true
  allowPopupsToEscapeSandbox: false
  allowSameOrigin: false
```

Supported sandbox fields:

| Field | Iframe sandbox token |
| --- | --- |
| `allowDownloads` | `allow-downloads` |
| `allowForms` | `allow-forms` |
| `allowModals` | `allow-modals` |
| `allowPopups` | `allow-popups` |
| `allowPopupsToEscapeSandbox` | `allow-popups allow-popups-to-escape-sandbox` |
| `allowSameOrigin` | `allow-same-origin` |

By default, extensions do not use `allow-same-origin`. Browser messages from
that sandbox arrive with origin `null`, so Temporal UI validates both the
configured iframe `src` and the `event.source` window. If `allowSameOrigin` is
enabled, messages must come from the configured `allowedOrigin`.

Only enable sandbox permissions the extension actually needs.

## Sizing

The host iframe container uses configured initial dimensions and accepts resize
messages from the extension.

Default and bounds:

| Dimension | Default | Minimum fallback | Maximum fallback |
| --- | ---: | ---: | ---: |
| Height | `160` | `32` | `800` |
| Width | `100%` | `32` | `1200` |

If `defaultWidth` is omitted, the iframe container fills the available width.
If `defaultWidth` is set, the host uses a fixed pixel width clamped by
`minWidth` and `maxWidth`.

Resize messages are throttled by the host, so extensions should send them when
content changes rather than in a tight loop.

## Host Messages

Temporal UI sends messages to the iframe after it loads, when the extension sends
`ready`, and when context or theme changes.

Context message:

```ts
{
  type: 'temporal-ui/context',
  version: 1,
  extensionId: string,
  context: {
    uiVersion: string,
    temporalVersion?: string,
    basePath: string,
    route: {
      pathname: string,
      search: string,
      params: Record<string, string>
    },
    namespace?: string,
    workflow?: {
      workflowId: string,
      runId: string,
      status?: string,
      taskQueue?: string,
      workflowType?: string
    },
    user?: {
      email?: string
    }
  }
}
```

Theme message:

```ts
{
  type: 'temporal-ui/theme',
  version: 1,
  extensionId: string,
  theme: 'light' | 'dark'
}
```

Workflow context is only included when the slot has workflow data and the
extension has the `context:workflow` permission. User context is only included
when the host provides user data and the extension has the `context:user`
permission.

## Extension Messages

All extension-to-host messages must include:

```ts
{
  version: 1,
  extensionId: 'the-configured-extension-id'
}
```

### Ready

Send this when the extension has initialized and wants the latest host state:

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/ready',
    version: 1,
    extensionId: 'workflow-header-summary',
  },
  '*',
);
```

### Resize

Send this when the extension needs a different iframe size:

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/resize',
    version: 1,
    extensionId: 'workflow-header-summary',
    height: document.documentElement.scrollHeight,
    width: 400,
  },
  '*',
);
```

`height` and `width` are optional, but at least one must be present. Values must
be finite numbers. The host clamps them to the configured sizing bounds.

### Navigate

Send this to request navigation within Temporal UI:

```ts
window.parent.postMessage(
  {
    type: 'temporal-extension/navigate',
    version: 1,
    extensionId: 'workflow-header-summary',
    href: '/namespaces/default/workflows',
  },
  '*',
);
```

Navigation is ignored unless the extension has the `navigation:write`
permission. Even with that permission, only same-origin Temporal UI paths are
accepted. External navigation requests are ignored.

## Permissions

Permissions are opt-in. Configure only what an extension needs:

| Permission | Effect |
| --- | --- |
| `context:workflow` | Includes workflow context in host context messages when the slot provides it. |
| `context:user` | Includes user context when the host provides it. |
| `navigation:write` | Allows the extension to request same-origin Temporal UI navigation. |

Without `context:workflow`, workflow fields are stripped from context messages
even in workflow slots.

## Extension Author Checklist

When building an extension page:

1. Render a standalone HTML page that works inside an iframe.
2. Keep the body margin at `0` and avoid page scrollbars unless intentional.
3. Use the configured extension `id` as every message's `extensionId`.
4. Send `temporal-extension/ready` after startup.
5. Listen for `temporal-ui/theme` and apply light or dark styling.
6. Listen for `temporal-ui/context` and update UI from the read-only context.
7. Send `temporal-extension/resize` after content changes.
8. Host the page on the same origin as `allowedOrigin`.
9. Avoid broad sandbox permissions.

## Adding A New Slot To Temporal UI

UI contributors can add new extension points by rendering `ExtensionSlot` in a
stable location:

```svelte
<ExtensionSlot
  name="workflow.header.after-details"
  class="flex w-full flex-col gap-2"
  context={{
    workflow: {
      workflowId,
      runId,
      status: workflow?.status,
      taskQueue: workflow?.taskQueue,
      workflowType: workflow?.name,
    },
  }}
/>
```

Choose slot names that describe the UI surface and placement. Keep names stable;
they become configuration contracts for operators. When the slot provides
sensitive or high-cardinality context, pair it with an explicit permission and
filter that context through the host protocol.

## Troubleshooting

If an extension does not appear:

- Confirm `customUi.enabled` is `true`.
- Confirm the configured `slot` exactly matches a mounted slot.
- Confirm the current route matches `routePatterns`.
- Confirm `src` and `allowedOrigin` resolve to the same origin.
- Use HTTPS for remote extensions.
- Check browser console errors for iframe blocking headers such as
  `X-Frame-Options` or CSP `frame-ancestors`.
- Set a visible `defaultHeight`; an iframe with tiny content can otherwise look
  empty.

If messages are ignored:

- Confirm `extensionId` matches the configured `id`.
- Confirm `version` is `1`.
- Confirm the message `type` is one of the supported protocol messages.
- For workflow data, confirm `permissions` includes `context:workflow`.
- For navigation, confirm `permissions` includes `navigation:write` and `href`
  points to the same Temporal UI origin.

## Related Files

- `docs/custom-ui-iframes.md` contains a shorter overview.
- `server/config/development.yaml` contains local example configuration.
- `static/custom-ui-examples/` contains example iframe pages.
- `src/lib/components/extensions/` contains the Svelte host components.
- `src/lib/extensions/` contains URL validation, sizing, routing, and message
  helpers.
