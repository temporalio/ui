#!/bin/sh

git fetch --tags
tag=`git describe --abbrev=0 --tags`
gh release create $tag --generate-notes
