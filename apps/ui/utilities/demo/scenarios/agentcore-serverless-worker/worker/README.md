# The Worker this scenario runs in AgentCore

A Bedrock AgentCore Runtime container that starts a Temporal Worker.

AgentCore has no async invoke, so temporal-auto-scaled-workers calls
`/invocations` and closes the response stream at once. The shape that follows
is: start the Worker in the background, answer 200 immediately, and keep
polling for the life of the AgentCore session.

Two requirements are easy to miss:

- **`linux/arm64`.** AgentCore Runtime does not accept amd64 images.
- **Every workflow needs a `VersioningBehavior`.** A Worker built with
  `UseVersioning` panics with `workflow type does not have a versioning
  behavior` on `RegisterWorkflow`, before it ever polls, and the panic does
  not mention versioning as the cause. `RegisterWorkflowWithOptions` with
  `VersioningBehaviorPinned` is what a serverless Worker wants: the session
  that picks up a run finishes it.

`pnpm demo start agentcore-serverless-worker` builds and pushes this when
`provision` is on. Nothing here is imported by the TypeScript; it is the image
source.
