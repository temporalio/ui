#!/bin/bash

set -eu -o pipefail

if [ -f ./config/config-template.yaml ]; then
    >&2 echo "Custom config templates should now be mounted at: /home/ui-server/config/docker.yaml"
    >&2 echo "Please see the README for details on config templating support"
    dockerize -template ./config-template.yaml:./config/docker.yaml
fi

# Run bash instead of ui-server if "bash" is passed as an argument (convenient to debug docker image).
for arg in "$@" ; do [[ ${arg} == "bash" ]] && bash && exit 0 ; done

exec ./ui-server --env docker start
