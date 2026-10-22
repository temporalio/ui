# Using UI with Cloud

To run a local instance of the UI server pointing at Temporal Cloud:

1. Create your environment file. Copy `.env.ui-server-cloud.local.example` and drop the `.example`.
2. Build and run the docker image. It runs via docker compose:
   `docker compose -f docker-compose.cloud.yml up --build -d`
3. Open your browser to: http://localhost:8080/namespaces/<your namespace>/workflows

Changes to the environment file require a rebuild.
