# Custom UI Iframe Extensions

Temporal UI can mount configured iframe extensions into stable extension slots.
Iframe extensions are isolated with a sandbox and receive read-only UI context
through a versioned `postMessage` protocol.

## Example Configuration

```yaml
customUi:
  enabled: true
  iframeExtensions:
    - id: top-nav-status
      title: Notification Center
      slot: app.top-nav.actions.after
      src: /custom-ui-examples/top-nav.html
      allowedOrigin: self
      sizing:
        defaultWidth: 220
        minWidth: 220
        maxWidth: 220
        defaultHeight: 32
        minHeight: 32
        maxHeight: 32

    - id: workflow-header-summary
      title: PulseMeter metrics login
      slot: workflow.header.after-details
      src: /custom-ui-examples/workflow-header.html
      allowedOrigin: self
      routePatterns:
        - /namespaces/:namespace/workflows/:workflow/:run/*
      sizing:
        defaultHeight: 140
        minHeight: 96
        maxHeight: 480
      permissions:
        - context:workflow
```

`allowedOrigin: self` resolves to the current Temporal UI origin at runtime. For
remote iframe extensions, use an explicit HTTPS origin such as
`https://extensions.example.com`. Wildcards are rejected.

By default, iframes run without `allow-same-origin`. Browsers report messages
from that sandbox as origin `null`, so the host validates both the configured
iframe `src` and the `event.source` window. If an extension explicitly enables
`sandbox.allowSameOrigin`, messages must come from the configured
`allowedOrigin`.

## Stable Slots

The initial slots are:

```txt
app.top-nav.actions.after
workflow.header.after-details
```

Each slot renders a stable host element:

```html
<div data-temporal-extension-slot="workflow.header.after-details"></div>
```

The workflow header slot also exposes stable attributes for browser-extension
style injection:

```html
data-temporal-namespace data-temporal-workflow-id data-temporal-run-id
```

## Host Messages

The host sends:

```ts
{
  type: 'temporal-ui/context',
  version: 1,
  extensionId: string,
  context: ExtensionContext
}
```

```ts
{
  type: 'temporal-ui/theme',
  version: 1,
  extensionId: string,
  theme: 'light' | 'dark'
}
```

Workflow context is only included when the extension has the
`context:workflow` permission.

## Extension Messages

The iframe may send:

```ts
{ type: 'temporal-extension/ready', version: 1, extensionId: string }
```

```ts
{
  type: 'temporal-extension/resize',
  version: 1,
  extensionId: string,
  height?: number,
  width?: number
}
```

```ts
{
  type: 'temporal-extension/navigate',
  version: 1,
  extensionId: string,
  href: string
}
```

Navigation is ignored unless the extension has the `navigation:write`
permission, and only same-origin Temporal UI paths are accepted.
