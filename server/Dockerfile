FROM golang:1.25.7-alpine3.23 AS server-builder

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

FROM golang:1.25.7-alpine3.23 AS dockerize-builder

ARG DOCKERIZE_VERSION=v0.10.1
RUN go install github.com/jwilder/dockerize@${DOCKERIZE_VERSION} && \
    cp $(which dockerize) /usr/local/bin/dockerize

FROM alpine:3.23.3 AS ui-server

RUN apk upgrade --no-cache && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    bash \
    curl

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
