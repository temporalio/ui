FROM --platform=linux/arm64 golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o /worker main.go

FROM --platform=linux/arm64 alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /worker /worker
EXPOSE 8080
ENTRYPOINT ["/worker"]
