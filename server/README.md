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

Set `TEMPORAL_UI_BANNER_TEXT=PRODUCTION` and `TEMPORAL_UI_BANNER_COLOR=info`
when running the Docker image to show a persistent banner and prefix browser page titles
with `PRODUCTION | `. The banner also appears on the login screen and cannot
be dismissed.

Set `TEMPORAL_UI_BANNER_COLOR` to choose a color preset:

```bash
export TEMPORAL_UI_BANNER_TEXT="Test"
export TEMPORAL_UI_BANNER_COLOR="Warning"
```

For a custom YAML configuration or `server/config/development.yaml`, set:

```yaml
banner:
  text: "Test"
  color: "Warning"
```

Supported colors are `info` (blue), `warning` (amber), `success` (green), and
`error` (red). Values are case-insensitive and surrounding whitespace is ignored.
Both text and color are required. Missing, empty, or invalid values disable
the banner and page-title prefix without causing an error. Presets use the UI's existing
background and border colors, adapting to light and dark themes. Custom colors
are not supported.

The development configuration uses literal strings. To read environment
variables instead, use the following in a configuration with `# enable-template`
at the top, as in the Docker configuration:

```yaml
banner:
  text: {{ env "TEMPORAL_UI_BANNER_TEXT" | yamlString }}
  color: {{ env "TEMPORAL_UI_BANNER_COLOR" | yamlString }}
```

Use a single-line plain-text label. Quotes, ampersands, colons, newlines, and
control characters are not supported; labels containing them disable the banner.
The `yamlString` template helper safely quotes environment values so invalid
banner values cannot break YAML parsing.

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
