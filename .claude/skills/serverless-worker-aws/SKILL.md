---
name: serverless-worker-aws
description: Set up the AWS side of a Temporal serverless worker — IAM role, Lambda function, and deploy — so the Worker Controller can scale workers from zero and you can exercise serverless worker deployments in the UI. Use when asked how to create the Lambda or IAM role for serverless workers, what to put in the Create Serverless Deployment form, or why an invoked Lambda never connects.
---

# Serverless Worker AWS Setup

Serverless worker deployments let the Worker Controller Instance (WCI) invoke an AWS Lambda when a task queue has backlog, so workers scale to zero when idle. Testing the UI's serverless deployment flows needs a real Lambda and IAM role behind them.

The worker itself lives in [temporalio/temporal-serverless-worker](https://github.com/temporalio/temporal-serverless-worker) — a Go Lambda that connects back to Temporal, polls a task queue, runs for 60 seconds, then exits. This skill covers the AWS setup that repo depends on and how it connects to the UI.

## How the pieces fit

```
Temporal (staging or local)
  └─ Worker Controller Instance
       ├─ sees backlog on the task queue
       ├─ assumes the IAM role via STS (with external ID)
       └─ invokes the Lambda
                 │
                 ▼
           AWS Lambda (Go worker)
                 │  connects back over mTLS (staging) or plaintext gRPC (local)
                 ▼
           Temporal frontend — polls, executes, self-terminates after 60s
```

Two values must agree in three places: `DEPLOYMENT_NAME` and `BUILD_ID` are set as Lambda environment variables, entered in the UI's Create Serverless Deployment form, and used by the worker to register its version. A mismatch means the Lambda runs and polls, but its work never lands under the deployment version you are looking at.

## Part 1 — AWS setup (one-time)

### 1.1 Create the IAM role

The Temporal server assumes this role to invoke your Lambda.

**Trust policy** — replace `ACCOUNT_ID`, `YOUR_USER`, and pick any string for `YOUR_EXTERNAL_ID`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:user/YOUR_USER"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "YOUR_EXTERNAL_ID"
        }
      }
    }
  ]
}
```

The external ID condition is not optional — `workercontroller.compute_providers.aws.require_role_and_external_id` defaults to `true`, and the WCI rejects role assumption without it. You reuse `YOUR_EXTERNAL_ID` verbatim in the UI form.

**Permissions policy** — attach inline:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:YOUR_FUNCTION_NAME"
    }
  ]
}
```

Keep the role ARN — `arn:aws:iam::ACCOUNT_ID:role/YOUR_ROLE_NAME`.

### 1.2 Let your own user assume it

Attach to your IAM user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::ACCOUNT_ID:role/YOUR_ROLE_NAME"
    }
  ]
}
```

### 1.3 Create the Lambda function

| Setting      | Value                                  |
| ------------ | -------------------------------------- |
| Runtime      | Amazon Linux 2023 (`provided.al2023`)  |
| Handler      | `bootstrap`                            |
| Architecture | `x86_64` (matches `LAMBDA_ARCH=amd64`) |
| Timeout      | `75` seconds                           |

The timeout must exceed 60 seconds. The worker self-terminates on a one-minute timer; a 60-second Lambda timeout kills it before it exits cleanly. 75 gives margin.

Keep the function ARN — `arn:aws:lambda:us-east-1:ACCOUNT_ID:function:YOUR_FUNCTION_NAME`.

### 1.4 Configure and deploy the worker

Clone the worker repo, copy `.env.example` to `.env`, and fill it in. `scripts/deploy.sh` builds the Go binary, uploads it, and sets the Lambda environment variables from that one file — you do not set them by hand in the console.

```bash
git clone https://github.com/temporalio/temporal-serverless-worker
cd temporal-serverless-worker
cp .env.example .env
# fill in .env, then:
bash scripts/deploy.sh
```

The values that matter:

| `.env` variable                                                     | Purpose                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `LAMBDA_ARN`                                                        | Function to deploy to; the function name is derived from it          |
| `IAM_ROLE_ARN`, `EXTERNAL_ID`                                       | Entered in the UI form, not used by the Lambda itself                |
| `LAMBDA_ARCH`                                                       | `amd64` for `x86_64`, `arm64` for Graviton — must match the function |
| `TQ_NAME`                                                           | Task queue the worker polls                                          |
| `DEPLOYMENT_NAME`, `BUILD_ID`                                       | Must match the UI form exactly                                       |
| `TEMPORAL_ADDRESS`, `TEMPORAL_NAMESPACE`                            | Target server; take precedence over `HOST_PORT` / `NAMESPACE`        |
| `TEMPORAL_TLS_CLIENT_CERT_BASE64`, `TEMPORAL_TLS_CLIENT_KEY_BASE64` | mTLS to Temporal Cloud, base64-encoded PEM                           |

Re-run `scripts/deploy.sh` after any change to the Go code or to `.env`.

## Part 2 — Create the deployment in the UI

1. Go to **Workers** in the UI.
2. Create a serverless deployment.
3. Fill in:
   - **Name** — must equal `DEPLOYMENT_NAME`
   - **Build ID** — must equal `BUILD_ID`
   - **Lambda ARN** — from 1.3
   - **IAM Role ARN** — from 1.1
   - **External ID** — the exact string from the trust policy
4. Submit. The first version is set as current automatically on create.

Start a workflow on `TQ_NAME`; the WCI invokes the Lambda once backlog appears. The worker repo ships `./scripts/run-workflow.sh food|trip|confirm` for this.

## Part 3 — Targeting a server

### Staging (Temporal Cloud) — the default

Set `TEMPORAL_ADDRESS` and `TEMPORAL_NAMESPACE` in `.env`, plus the two base64 mTLS variables, and deploy. Nothing session-specific to maintain.

```bash
# encode a PEM from 1Password (macOS)
echo "CERT_CONTENT" | base64
```

### Local Temporal via ngrok

Only worth it when you need a server build that is not on staging. See [local-temporal](../local-temporal/SKILL.md) for running the UI against a local server, then:

1. `ngrok tcp 7233` — note the forwarding address, which changes each session on a free plan.
2. Set `HOST_PORT` to that address in `.env` (leave `TEMPORAL_ADDRESS` unset) and re-run `scripts/deploy.sh`.
3. Enable the worker controller in the local server's dynamic config, typically `config/dynamicconfig/development-sqlite.yaml` in the `temporalio/temporal` repo — confirm the path via `dynamicConfigClient.filepath` in `config/development.yaml`:

   ```yaml
   workercontroller.enabled:
     - value: true
       constraints:
         namespace: default

   workercontroller.compute_providers.enabled:
     - value:
         - aws-lambda

   workercontroller.scaling_algorithms.enabled:
     - value:
         - no-sync

   workercontroller.compute_providers.aws.require_role_and_external_id:
     - value: true
   ```

   The server hot-reloads this file every 10 seconds — no restart needed.

4. Export AWS credentials **before** `make start`. The worker controller reads them at process startup; exporting afterward has no effect on the running server.

   ```bash
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_DEFAULT_REGION=us-east-1
   make start
   ```

The worker repo's `scripts/dev.sh` automates this loop; it needs `TEMPORAL_DIR` and `UI_PATH` set in `.env`.

## Verifying it worked

```bash
aws logs tail /aws/lambda/YOUR_FUNCTION_NAME --region us-east-1 --since 2m --follow
```

A healthy run:

```
subprocess worker starting  {"hostPort": "...", "namespace": "...", "taskQueue": "..."}
Started Worker
Running workflow  {"workflow_name": "..."}
Worker has been stopped  {"Signal": "timed out"}
```

`Signal: timed out` is the clean exit after 60 seconds, not a failure.

## When it does not work

| Symptom                                                  | Cause                                                                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lambda is never invoked                                  | External ID missing or mismatched in the trust policy; or AWS credentials were not in the server's environment at startup     |
| Lambda invoked, no log output at all                     | Architecture mismatch — `LAMBDA_ARCH` in `.env` disagrees with the function's architecture                                    |
| `subprocess worker starting` then a connect timeout      | Stale `HOST_PORT` — the ngrok address changed and the Lambda was not redeployed                                               |
| Lambda times out instead of exiting cleanly              | Function timeout is 60 seconds or less; raise it to 75                                                                        |
| Worker polls but the UI shows no activity on the version | `DEPLOYMENT_NAME` or `BUILD_ID` differs between `.env` and the UI form                                                        |
| TLS handshake failure against Cloud                      | Cert and key must both be set and base64-encoded; do not also set `ENABLE_TLS`, which selects the legacy Secrets Manager path |

Versions created outside the UI are not promoted automatically:

```bash
temporal worker deployment set-current-version \
  --deployment-name "$DEPLOYMENT_NAME" \
  --build-id "$BUILD_ID" \
  --namespace "$TEMPORAL_NAMESPACE"
```
