# Using UI with Cloud

To run a local instance of the UI server pointing at Temporal Cloud:

1. Create your environment file. See below.
2. Build and run the docker image. It runs via docker compose:
   `docker compose -f docker-compose.cloud.yml up --build -d`
3. Open your browser to: http://localhost:8080/namespaces/<your namespace>/workflows

Changes to the environment file require a rebuild.

## Environment file

The Docker build expects the environment file to be named `.env.ui-server-cloud.local`.
The easiest way to get started is to copy the `.example` file to that location and fill in the values.
Replace these as follows:

- `TEMPORAL_ADDRESS`: This is the full regional host plus port for the temporal cloud region hosting the namespace. For example: `ca-central-1.aws.api.temporal.io:7233`
- `TEMPORAL_API_KEY`: This is an API key from the target namespace
- `TEMPORAL_DEFAULT_NAMESPACE`: Full namespace identifier e.g., `temporal-support-worker.a2dd6`
- `TEMPORAL_TLS_SERVER_NAME`: The host portion of `TEMPORAL_ADDRESS`; e.g., `ca-central-1.aws.api.temporal.io`
