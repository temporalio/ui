FROM golang:1.24-alpine3.22 AS server-builder

RUN apk upgrade --no-cache
RUN apk add --no-cache \
    make \
    git \
    curl

WORKDIR /home/server-builder

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN make build-server

##### Dockerize builder #####

FROM golang:1.24-alpine3.22 AS dockerize-builder

ARG DOCKERIZE_VERSION=v0.9.2
RUN go install github.com/jwilder/dockerize@${DOCKERIZE_VERSION}
RUN cp $(which dockerize) /usr/local/bin/dockerize

##### UI server #####

FROM alpine:3.22 AS ui-server

RUN apk upgrade --no-cache
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    bash \
    curl

COPY --from=dockerize-builder /usr/local/bin/dockerize /usr/local/bin

SHELL ["/bin/bash", "-c"]

ARG TEMPORAL_CLOUD_UI="false"

WORKDIR /home/ui-server

RUN addgroup -g 1000 temporal
RUN adduser -u 1000 -G temporal -D temporal
RUN mkdir ./config

COPY --from=server-builder /home/server-builder/ui-server ./
COPY config/docker.yaml ./config/docker.yaml
COPY docker/start-ui-server.sh ./start-ui-server.sh

RUN chown temporal:temporal /home/ui-server -R

EXPOSE 8080
ENTRYPOINT ["./start-ui-server.sh"]
ENV TEMPORAL_CLOUD_UI=$TEMPORAL_CLOUD_UI
