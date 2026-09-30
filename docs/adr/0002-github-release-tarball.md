# Publish via GitHub Release tarballs

Hosts must install without registry auth. We publish `@forkbombeu/temporal-ui` as a versioned `.tgz` on GitHub Releases (`2.54.1-fb.n`), not as a `github:` repo dependency and not via GitHub Packages. CI builds from the pinned Upstream submodule and attaches the artifact to the release.
