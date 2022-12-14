#!/bin/sh

version=`git describe --abbrev=0 --tags`
branch="releases/$version"

git checkout -b $branch
git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPO}"
git push --tags origin $branch
gh pr create -B main -H $branch --title "bump version in package.json to $version"
