# Runnable custom UI extension example

This example is a small, framework-free implementation of the Temporal UI
iframe protocol. It is deliberately served from a different origin than
Temporal UI.

It demonstrates:

- the version 1 `hello` / `welcome` / `ready` handshake;
- exact parent source, origin, extension ID, and per-load instance checks;
- theme and viewport updates;
- host-clamped resize requests;
- safe display of explicitly granted context; and
- permission-gated navigation requests.

## Run it locally

Start the example and the opt-in Temporal UI development mode from the
repository root in separate terminals:

```sh
# Terminal 1: extension origin (http://127.0.0.1:8090)
pnpm dev:extension-example
```

```sh
# Terminal 2: Temporal UI (http://localhost:3000)
pnpm dev:ui:extension-example
```

Open `http://localhost:3000`. With no `routePatterns`, the example appears on
every application page.

The second command enables the environment-gated example definition already in
`server/config/development.yaml`. Normal `pnpm dev:local-temporal` development keeps
custom UI disabled, so the example never becomes an unexpected dependency.

The local definition intentionally has no permissions and does not enable
`sandbox.allowSameOrigin`. This gives the iframe an opaque origin and keeps the
loopback HTTP example within the unprivileged development policy. It still
receives theme and viewport messages and can request a resize, but it receives
no route, namespace, or workflow context.

An opaque iframe reports its origin as `null`. This example uses a classic
deferred entry script so the browser does not require a CORS-enabled module
fetch. Its small development server serves only the three checked-in assets and
injects no development client. An opaque production extension that uses module
scripts must instead return an appropriate `Access-Control-Allow-Origin`
header; do not enable `allowSameOrigin` only to silence a CORS error.

The local server policy and the `temporal-ui-origin` metadata in `index.html`
both trust exactly `http://localhost:3000`. If the development UI uses another
origin, update both values rather than adding a wildcard.

## Adapt it for a privileged production extension

Before granting context or navigation:

1. Host these files on a dedicated HTTPS origin that is different from the
   Temporal UI origin.
2. Change the `temporal-ui-origin` metadata in `index.html` to the exact
   production Temporal UI origin.
3. Return a `Content-Security-Policy` response header whose `frame-ancestors`
   contains that exact Temporal UI origin. The included development server is
   only for the local example.
4. Keep `temporal-extension-id` synchronized with the server definition.
5. Set `allowedOrigin` to the extension's exact HTTPS origin and enable
   `sandbox.allowSameOrigin`.
6. Grant only the context and host actions the extension needs.

For example:

```yaml
customUi:
  enabled: true
  iframeExtensions:
    - id: local-extension-example
      title: Workflow helper
      slot: workflow.header.after-details
      src: https://temporal-extension.example.com/
      allowedOrigin: https://temporal-extension.example.com
      routePatterns:
        - /namespaces/:namespace/workflows/:workflow/:run/*
      sandbox:
        allowSameOrigin: true
      sizing:
        defaultHeight: 112
        minHeight: 72
        maxHeight: 200
      permissions:
        - context:namespace
        - context:workflow
        - navigation:write
```

Host context is display data, not an authentication credential. A real
extension must use its own audience-restricted authentication for backend
requests and must never treat workflow or namespace fields as proof of access.
