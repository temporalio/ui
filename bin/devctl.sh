#! /usr/bin/env bash

# get the scripts directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# build devctl
pushd $DIR/../utilities/devctl
go build .
popd

$DIR/../utilities/devctl/devctl --config-dir ./configs
