# ui-server

[![Publish Docker image](https://github.com/temporalio/ui-server/actions/workflows/docker.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/docker.yml)

## Development

https://github.com/temporalio/ui-server is automatically updated to mirror
changes to https://github.com/temporalio/ui/tree/main/server; commits should be
made to the UI repository.

For contributions follow UI's development guide https://github.com/temporalio/ui

### Hot Reloading

The development server uses [Air](https://github.com/air-verse/air) for automatic hot reloading when Go source files change. Air will be automatically installed on first run in development mode, which may take a moment.

## Configuration

### Environment banner

Set `TEMPORAL_UI_BANNER_TEXT=PRODUCTION` when running the Docker image or the
local UI server to show a persistent banner and prefix browser page titles
with `PRODUCTION | `. The banner also appears on the login screen and cannot
be dismissed.

For a custom YAML configuration, set:

```yaml
bannerText: PRODUCTION
```

Use a single-line plain-text label. Quotes, ampersands, colons, and newlines
are not supported in the environment variable. Empty or whitespace-only text
shows no banner and leaves page titles unchanged.

Restart the UI server after changing the environment variable and reload
open browser tabs.

### CORS Settings

The server supports flexible CORS configuration through YAML config files:

```yaml
cors:
  allowOrigins:
    - "https://example.com"
    - "https://app.example.com"
  unsafeAllowAllOrigins: false  # Default: false
  cookieInsecure: false
```

**Configuration Options:**

- `allowOrigins`: List of explicitly allowed origins for CORS requests
- `unsafeAllowAllOrigins`: **⚠️ UNSAFE** - When `true`, allows any origin that makes a request. Only enable for development/testing environments
- `cookieInsecure`: Allow CSRF cookies over insecure connections (useful for VPN scenarios)

**Security Note:** The `unsafeAllowAllOrigins` setting bypasses CORS security and should never be enabled in production. It dynamically allows the requesting origin, which can expose your API to cross-origin attacks.

## To View gRPC routes:
[Temporal API Workflowservice](https://github.com/temporalio/api/blob/master/temporal/api/workflowservice/v1/service.proto)
