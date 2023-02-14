#!/bin/bash

set -eu -o pipefail

dockerize -template ./config/config_template.yaml:./config/docker.yaml

# Run bash instead of Temporal Server if "bash" is passed as an argument (convenient to debug docker image).
for arg in "$@" ; do [[ ${arg} == "bash" ]] && bash && exit 0 ; done

exec ./ui-server --env docker start
