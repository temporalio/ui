ARG BUILDER_BASE_IMAGE=golang:1.27.3-alpine3.24
ARG ALPINE_TAG=3.24

FROM ${BUILDER_BASE_IMAGE} AS server-builder

RUN apk upgrade --no-cache && \
    apk add --no-cache \
    make \
    git \
    curl

WORKDIR /home/server-builder

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN make build-server

FROM ${BUILDER_BASE_IMAGE} AS dockerize-builder

ARG DOCKERIZE_VERSION=v0.16.0
RUN go install github.com/jwilder/dockerize@${DOCKERIZE_VERSION} && \
    cp $(which dockerize) /usr/local/bin/dockerize

FROM alpine:${ALPINE_TAG} AS ui-server

RUN apk upgrade --no-cache && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    bash

COPY --from=dockerize-builder /usr/local/bin/dockerize /usr/local/bin

SHELL ["/bin/bash", "-c"]

ARG TEMPORAL_CLOUD_UI="false"

WORKDIR /home/ui-server

RUN addgroup -g 1000 temporal && \
    adduser -u 1000 -G temporal -D temporal && \
    mkdir ./config

COPY --chown=temporal:temporal --from=server-builder /home/server-builder/ui-server ./
COPY --chown=temporal:temporal config/docker.yaml ./config/docker.yaml
COPY --chown=temporal:temporal docker/start-ui-server.sh ./start-ui-server.sh

USER temporal

EXPOSE 8080
ENV TEMPORAL_CLOUD_UI=$TEMPORAL_CLOUD_UI
ENTRYPOINT ["./start-ui-server.sh"]
