# ui E2E tests

[![E2E Tests](https://github.com/temporalio/ui/actions/workflows/e2e.yml/badge.svg)](https://github.com/temporalio/ui/actions/workflows/e2e.yml)

E2E specifies a set of tests that run against a real Temporal server.

To run these tests manually (to aid debugging) you can:

1. Install the required packages (if you haven't already):
   `pnpm install`
1. Install playwright's chromium bundle (if you haven't already):
   `npx playwright install chromium --with-deps`
1. Build the current UI code, from the root directory of the project:
   `pnpm build:local`
1. Run a local Temporal dev server:
   `temporal server start-dev --ui-asset-path ../.vercel/output/static/ --ui-codec-endpoint http://localhost:8234 &`
1. Create the workflow data the tests use:
   `go run ./worker &`
   `go run ./starter`
1. Start a codec server, which the tests rely on:
   `go run ./codec-server -port 8234 -web http://localhost:8233 &`
1. Run the tests:
   `npx playwright test`
