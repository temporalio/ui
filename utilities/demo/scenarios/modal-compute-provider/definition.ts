import { defineScenario } from '../../../../src/lib/demo/definition';

export const definition = defineScenario({
  name: 'modal-compute-provider',
  title: 'Modal as a serverless Worker compute provider',
  summary:
    'Saves a Worker Deployment Version that runs its Workers as a Modal Function, and runs one. Modal reaches the server through the worker controller, which registers the modal-function provider; no release carries it yet, so the server is built with that module pinned. Open source authorizes Modal with one API key for the whole process, so the form collects identifiers only and has no Access section.',
  server: {
    // modal-function is registered by the worker controller, not by the
    // server, so the server itself needs no branch -- only the module pinned
    // below. Its own main compiles against this module unchanged.
    source: 'workspace',
    requires: {
      // CLI main and server main are not a compatible pair today: the server
      // moved to SDK v1.49.0, which removed a field the CLI still sets
      // (StartActivityOptions.Details). This tag is the newest server that
      // still names SDK v1.48.0, and it names the same api as the CLI does,
      // v1.63.5, so the pair resolves. Modal needs nothing from the server
      // itself, so an older one costs this scenario nothing.
      serverRef: 'v1.32.0-163.0',
      pinnedModules: {
        // The worker controller that registers modal-function. Pinned, not a
        // floor: the commit is not on that module's main, so anything later
        // drops the provider again and the server rejects the type.
        'go.temporal.io/auto-scaled-workers':
          'v0.0.0-20261019221628-e592d6de707e',
      },
      commands: ['modal', 'temporal'],
    },
    // Distinct ports on purpose. Every stage stands down when something already
    // listens, and a stock server or UI there would make this run prove nothing.
    port: 7733,
    uiPort: 8733,
    httpPort: 7743,
    dynamicConfig: {
      'workercontroller.enabled': true,
      'workercontroller.compute_providers.enabled': ['modal-function'],
    },
    // MODAL_TOKEN_ID and MODAL_TOKEN_SECRET are not named here. The provider
    // leaves credentials to the Modal SDK, and the server process inherits
    // this shell, so the token pair reaches it the same way `modal run` gets
    // it. Nothing about a Modal credential belongs in a definition.
  },
  // A Modal Function runs in Modal's cloud and dials the frontend back to
  // poll. localhost is not reachable from there, so the inbound leg needs a
  // public address.
  tunnel: { enabled: true },
  ui: {
    apiPort: 8781,
    webPort: 3700,
  },
  // The catalog cannot exercise this feature. Its worker is unversioned, so it
  // registers no Worker Deployment, and a compute config is attached through
  // the update RPC, not by a Worker describing itself.
  worker: { enabled: false },
  examples: [],
  preview: {
    notes: [
      'Prerequisite: a Modal account, the `modal` CLI authenticated (`modal token new`), and a deployed App whose Function runs a Temporal Worker. `modal app list` must show it. Creating a Version resolves the Function through Modal, so a name that is not deployed stops the save at the provider.',
      'The Worker inside the Function must dial the public address this run prints, not localhost. A fresh run means a fresh hostname, so redeploy the App with the printed address rather than trusting one stored from a previous run.',
      'Open Workers, then Create Serverless Worker, then Change under Compute Provider. The list must offer Modal, badged Pre-release, with the Modal mark beside it.',
      'Select Modal. The form must show Resource and Scaling and Lifecycle, and no Access section at all. Open source authorizes Modal with one API key held by the server process, so there is no per-Version credential to collect. Selecting AWS Lambda again must bring its IAM Role ARN and External ID back.',
      'Resource must ask for App Name, Function Name and Environment as required, and Workspace ID and App Version as optional. Leaving Workspace ID blank must be accepted: the API key already determines the workspace.',
      'Submit with App Name and Function Name filled and Environment empty. The form must refuse it. The provider requires an environment and gives no default, so a Version saved without one fails at invoke time instead.',
      'Fill the Resource fields and submit. The Version must save and appear in the deployments list naming Modal as its provider. Open it: the compute config must carry app_name, function_name and environment, and must carry no credential of any kind. Anyone who can read the Version can read its config back.',
      "Start a Workflow on the Version's task queue. The worker controller must invoke the Function, and `modal app logs <app>` must show the Worker starting and polling. The Workflow completes once it does.",
      'Edit the Version and change the Function Name. The form must read the saved values back unchanged before the edit, including a blank Workspace ID.',
      'Hosted Temporal authorizes Modal per account through an OAuth grant instead of one process-wide key, and supplies its own credential fields for that. This scenario shows the open-source path only.',
    ],
  },
});
