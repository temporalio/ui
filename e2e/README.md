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
1. Run a local Temporal dev server, codec-server and worker in the background, run the test workflows:
   `pnpm run test:server &`
   `pnpm run test:worker &`
   `pnpm run test:workflows`
1. Run the tests:
   `pnpm run test`
