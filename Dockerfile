ARG BASE_SERVER_IMAGE=temporalio/base-server:1.10.0
ARG BASE_BUILDER_IMAGE=temporalio/base-builder:1.9.0

##### UI builder #####
FROM ${BASE_BUILDER_IMAGE} AS ui-builder
ARG TEMPORAL_PUBLIC_PATH

WORKDIR /home/ui-builder

RUN apk add --update --no-cache \
    npm
RUN npm install -g pnpm

COPY go.mod go.sum ./
RUN go mod download
COPY Makefile .
RUN make install-utils

COPY . .
ENV VITE_PUBLIC_PATH=$TEMPORAL_PUBLIC_PATH
RUN make install-ui
RUN make build-ui build-server

##### UI server #####
FROM ${BASE_SERVER_IMAGE} AS ui-server
WORKDIR /home/ui-server

RUN addgroup -g 5000 temporal
RUN adduser -u 5000 -G temporal -D temporal

COPY --from=ui-builder /home/ui-builder/ui-server ./
COPY docker/start-ui-server.sh ./start-ui-server.sh
COPY docker/config_template.yaml ./config/config_template.yaml

RUN chown temporal:temporal /home/ui-server -R

EXPOSE 8080
ENTRYPOINT ["./start-ui-server.sh"]
