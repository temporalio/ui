# Pristine Upstream as a git submodule

Forking and squash-merging `temporalio/ui` made syncs painful (merge-base stuck on old tags, committed `dist/` drifted). We keep Upstream as an unmodified git submodule pinned to a release tag (`v2.54.1` for the first Package), and author only Adapter code outside it. Bumping Upstream means moving the submodule pointer, not merging trees.
