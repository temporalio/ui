.ONESHELL:
.PHONY:

all: install-utils build

##### Variables ######

ifndef GOPATH
GOPATH := $(shell go env GOPATH)
endif

GOBIN := $(if $(shell go env GOBIN),$(shell go env GOBIN),$(GOPATH)/bin)
PATH := $(GOBIN):$(PATH)

COLOR := "\e[1;36m%s\e[0m\n"

##### Build #####
build: build-server

build-server:
	go mod tidy
	go build -o ui-server ./cmd/server/main.go

##### Install dependencies #####

install-utils:
	@go install github.com/temporalio/gogo-protobuf/protoc-gen-gogoslick@latest
	@GO111MODULE=off go get github.com/temporalio/gogo-protobuf/protoc-gen-gogoslick
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

	@go install github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway@latest
	@go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest

##### Test #####
test: clean-test-results
	@printf $(COLOR) "Running unit tests..."
	go test ./... -race

clean-test-results:
	@rm -f test.log
	@go clean -testcache
