ARG BASE_SERVER_IMAGE=temporalio/base-server:1.10.0
ARG BASE_BUILDER_IMAGE=temporalio/base-builder:1.9.0

##### UI builder #####
FROM ${BASE_BUILDER_IMAGE} AS ui-builder

WORKDIR /home/ui-builder

RUN apk add --update --no-cache npm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY .babelrc .npmrc *.json *.yaml *.cjs *.js *.ts ./
COPY src src

ARG UI_PUBLIC_PATH
ARG UI_TARGET=local
ENV VITE_PUBLIC_PATH=$UI_PUBLIC_PATH
ENV VITE_TEMPORAL_UI_BUILD_TARGET=$UI_TARGET
RUN pnpm build:server

FROM ${BASE_BUILDER_IMAGE} AS server-builder

WORKDIR /home/server-builder

COPY server/Makefile ./
RUN make install-utils

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server ./
COPY --from=ui-builder /home/ui-builder/server/ui/assets ./ui/assets

RUN make build-server

##### UI server #####
FROM ${BASE_SERVER_IMAGE} AS ui-server
WORKDIR /home/ui-server

RUN addgroup -g 5000 temporal
RUN adduser -u 5000 -G temporal -D temporal

COPY --from=server-builder /home/server-builder/ui-server ./
COPY server/docker/start-ui-server.sh ./start-ui-server.sh
COPY server/docker/config_template.yaml ./config/config_template.yaml

RUN chown temporal:temporal /home/ui-server -R

EXPOSE 8080
ENTRYPOINT ["./start-ui-server.sh"]
