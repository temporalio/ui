## Hackathon 2025 Instructions

### Clone UI repo

https://github.com/temporalio/ui

### Prep

Run Temporal CLI

```
temporal server start-dev
```

Checkout hackathon branch, install and run local ui

```
git fetch
git checkout hackathon-2025
pnpm install
pnpm build:server
pnpm dev:local-temporal
```

Clone / fork Steve's AI demo

https://github.com/steveandroulakis/temporal-ai-agent

Follow the setup.md

- Add API model and key
- AGENT_GOAL=goal_choose_agent_type
