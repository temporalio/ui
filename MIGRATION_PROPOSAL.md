# Temporal UI Monorepo Migration

_Oregon Trail Edition_

![Oregon Trail](https://videos.openai.com/vg-assets/assets%2Ftask_01jr8g85k1e19b8evhnw16qfza%2Fimg_0.webp?st=2025-04-07T15%3A04%3A07Z&se=2025-04-13T16%3A04%3A07Z&sks=b&skt=2025-04-07T15%3A04%3A07Z&ske=2025-04-13T16%3A04%3A07Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=qN3YoUWOQ5PHD%2Fq92pL8lk2E5%2FZFHDzzkbID7eFmQhI%3D&az=oaivgprodscus)

## Overview

The Temporal UI team has loaded up their wagon, packed their crates,
and is ready to embark on a bold journey westward — toward the promised land of
a unified monorepo.

They’ve heard stories of faster builds, cleaner architecture, and shared
packages dancing freely across apps. But they’re also wary. The road is long,
and the terrain is unfamiliar. Some say entire builds have been lost to circular
dependencies. Others whisper of CI pipelines that vanished in the night.

And yet, there is hope. With careful planning, a trusty `pnpm` steed, and the
powerful `turborepo` oxen to pull us through, this migration can succeed. The
path won’t be easy — but it will be worth it.

## Goals

- Consolidate related packages and apps into a single workspace.
- Enable shared logic (schemas, components) to be centrally maintained.
- Cleanly separate OSS and internal UI code.
- Improve performance, coordination, and publishing workflows.

## Target Monorepo Layout

```
temporal-ui/
├── apps/
│   ├── cloud-ui/
│   ├── codec-server/
│   ├── dev-server/
│   └── oss-ui/
├── packages/
│   ├── schemas/
│   ├── oss-components/
│   └── holocene/
├── .github/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## App/Package dependency graph

```mermaid
flowchart TD
  subgraph Packages
    schemas["📦 schemas"]
    holocene["📦 holocene"]
  end

  subgraph Apps
    oss_ui["🧱 oss-ui"]
    cloud_ui["☁️ cloud-ui"]
    ui_server["🖥️ ui-server (Go)"]
    codec_server["🧪 codec-server (local npm tool)"]
  end

  %% Package usage
  oss_ui --> schemas
  oss_ui --> holocene
  cloud_ui --> oss_ui
  cloud_ui -->|wraps and enhances| oss_ui

  %% CI/CD pipeline
  oss_ui -->|on merge to main| ui_server
  ui_server -->|bundles oss-ui to assets| ui_server_assets[ui-server/assets]
  ui_server_assets -->|docker build + release artifacts| docker_release[Docker Image & Release Artifacts]

  %% Dev-only usage
  codec_server -->|used only for local payload testing| oss_ui
```

## Migration Plan

### Phase 1: Bootstrapping

- Initialize `pnpm` workspaces.
- Move `schemas` to `packages/schemas`.
- Keep `ui/` in root during the transition.

### Phase 2: Component Extraction

- Move UI components to `packages/oss-components`.
- Move Holocene into `packages/holocene`.

### Phase 3: Appification

- Convert `ui` to `apps/oss-ui`.
- Move `dev-server` and `codec-server` into `apps/`.
- Update `pnpm dev` to launch all apps using `turbo dev`.

### Phase 4: OSS/Public Split

- Mark `oss-ui` as private.
- Introduce `cloud-ui` as a separate app.
- Mirror OSS elements to a public GitHub repo via CI/CD.

## Build & Release Strategy

### Packages

- Semantic versioning for all shared packages.
- Publish to npm.
- Align GitHub release tags with package versions.
- Use `prepublishOnly` for builds and validation.

### Apps

- Each app can be built and deployed independently.
- Releases tied to GitHub tags.

### OSS Sync

- Use CI pipelines to:
  - Sync public packages/UI.
  - Mirror release tags and changelogs.

## Tooling

### pnpm

- Fast installs.
- Deterministic dependency resolution.
- Efficient disk space usage.

### turborepo

- Task-based pipelines for build, lint, test, publish.
- Incremental builds.
- Local + remote caching.
- Parallel execution.

## Benefits

- Shared logic is centralized and testable.
- Fast builds and CI via turbo + caching.
- Easier release and version tracking.
- Future-proof modular architecture.

## Potential Drawbacks

![Hardships](https://videos.openai.com/vg-assets/assets%2Ftask_01jr64vaa9fv0a1xs70xw07yn7%2Fimg_0.webp?st=2025-04-07T15%3A03%3A02Z&se=2025-04-13T16%3A03%3A02Z&sks=b&skt=2025-04-07T15%3A03%3A02Z&ske=2025-04-13T16%3A03%3A02Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=lYAbizuByWzS5tr%2FvnG%2BJFVWDTZN2V%2Bg55edcLY%2F9xQ%3D&az=oaivgprodscus)

| Hardship                  | Mitigation                                          | Oregon Trail Outcome                |
| ------------------------- | --------------------------------------------------- | ----------------------------------- |
| Migration complexity      | Follow phase plan and test incrementally            | Wagon tipped crossing the river     |
| CI pipeline setup         | Use turbo task definitions and remote caching       | Lost two oxen and half the build    |
| Multi-app dev setup       | Use `pnpm dev` to orchestrate local app development | Jeb tried to run all apps manually  |
| OSS/internal repo syncing | Automate syncing and tag mirroring via CI/CD        | Cholera outbreak in the public repo |

## Conclusion

_We’ve Made It to the Willamette Valley_

![Oregon Trail](https://videos.openai.com/vg-assets/assets%2Ftask_01jr64kfatf8wbkqm8qz1wy8n7%2Fimg_0.webp?st=2025-04-07T15%3A03%3A02Z&se=2025-04-13T16%3A03%3A02Z&sks=b&skt=2025-04-07T15%3A03%3A02Z&ske=2025-04-13T16%3A03%3A02Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=NFKCb8mDg4S5Ra8pW1IzMNbaudFKQmbPkEBB0aUOSrU%3D&az=oaivgprodscus)

After months of toil, trials, and tinkering, the Temporalities have crossed the
monorepo plains. They’ve survived the great package renaming, outlasted test
failures, and forded the mighty river of merge conflicts. Their reward? A clean,
modular codebase, efficient builds, and a future-proof structure that will serve
them for years to come.

Sure, we lost a few unused components along the way. And yes, someone _did_
briefly rename `main` to `wagon-lead`. But now we stand together, boots muddy,
hearts proud, in a monorepo built to last.

## Next Steps

1. Approve the monorepo structure and tooling.
2. Begin Phase 1: Move `schemas`.
3. Execute phases while coordinating with active development.
4. Finalize public OSS sync strategy and automate releases.
