# Upstream submodule

This repo vendors Temporal Web UI as a git submodule at `upstream/`, pinned to a release tag (currently `v2.54.1`). Never edit files under `upstream/`.

## Bump Upstream

```sh
cd upstream
git fetch --tags origin
git checkout vX.Y.Z
cd ..
git add upstream
git commit -m "chore: bump upstream to vX.Y.Z"
```

Then bump the Adapter Package version to `X.Y.Z-fb.0` and cut a Release.
