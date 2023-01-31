
# ui-server 

[![build](https://github.com/temporalio/ui-server/actions/workflows/test.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/test.yml)
[![E2E Tests](https://github.com/temporalio/ui-server/actions/workflows/e2e.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/e2e.yml)
[![Publish Docker image](https://github.com/temporalio/ui-server/actions/workflows/docker.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/docker.yml)
[![Update UI Submodule](https://github.com/temporalio/ui-server/actions/workflows/update-ui.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/update-ui.yml)

ui-server serves an HTTP API analogue of [Temporal gRPC API](https://github.com/temporalio/api) as well as serves Temporal UI https://github.com/temporalio/ui. It can be compiled into a binary or consumed as a Go library.

# Docker

ui-server is published on Docker Hub: https://hub.docker.com/r/temporalio/ui

You can run it with Temporal Server using the [Temporal docker-compose](https://github.com/temporalio/docker-compose/blob/main/docker-compose.yml).

See [Docker README](https://github.com/temporalio/ui-server/blob/main/docker/README.md) for more details on running Docker images 

# Configuration

- When running ui-server as a docker image, you can pass docker env variables to configure auth, TLS and other options. See [quickstart for production](https://github.com/temporalio/ui-server/tree/main/docker#quickstart-for-production). For all options refer to [Dockerize config template](https://github.com/temporalio/ui-server/blob/main/docker/config_template.yaml)

- Alternatively you can pass a .yaml configuration file based on the Dockerize template . Ex [development.yml config](https://github.com/temporalio/ui-server/tree/main/config)

Check out [the configuration docs](https://docs.temporal.io/references/ui-configuration) for more details

# Development

Pre-requirements:
 - Go v1.18 or later installed on your development machine
 - Protobuf installed on your development machine (`brew install protobuf`) (Note: M1 macs will need `/opt/homebrew/bin` on the PATH or you may get `/bin/sh: protoc: command not found` errors (or you can [manually download protoc](http://google.github.io/proto-lens/installing-protoc.html)))

Execute from the project folder to build a binary:
``` bash
make build-server
```

To start the server, execute
```
./ui-server start
```

- Open http://localhost:8080/ in the browser to explore the UI
- Open http://localhost:8080/openapi/ in the browser to explore HTTP API

## Debugging

In VSCode launch "Debug Server" script (or press F5)
