ARG BUILDER_BASE_IMAGE=golang:1.27.3-alpine3.24
ARG ALPINE_TAG=3.24

FROM --platform=linux/arm64 ${BUILDER_BASE_IMAGE} AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o /worker main.go

FROM --platform=linux/arm64 alpine:${ALPINE_TAG}
RUN apk upgrade --no-cache && apk add --no-cache ca-certificates
COPY --from=build /worker /worker
EXPOSE 8080
ENTRYPOINT ["/worker"]
