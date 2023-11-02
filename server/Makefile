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

PROTO_ROOT := proto/api
PROTO_FILES = $(shell find $(PROTO_ROOT) -name "*.proto")
PROTO_DIRS = $(sort $(dir $(PROTO_FILES)))
PROTO_OUT := api
PROTO_IMPORTS := \
	-I $(PROTO_ROOT) \
	-I ./proto/dependencies/github.com/grpc-ecosystem/grpc-gateway/ \
	-I ./proto/dependencies/github.com/gogo/googleapis/ \
	-I ./proto/dependencies/api/ \
	-I ./proto/dependencies/
PROTO_REFS := Mgoogle/protobuf/wrappers.proto=github.com/gogo/protobuf/types,Mgoogle/protobuf/duration.proto=github.com/gogo/protobuf/types,Mgoogle/protobuf/empty.proto=github.com/gogo/protobuf/types,Mgoogle/protobuf/descriptor.proto=github.com/gogo/protobuf/protoc-gen-gogo/descriptor,Mgoogle/protobuf/timestamp.proto=github.com/gogo/protobuf/types,Mgoogle/api/annotations.proto=github.com/gogo/googleapis/google/api
OPENAPI_OUT := openapi/assets

##### Build #####
build: build-grpc build-server

build-server:
	go mod tidy
	go build -o ui-server ./cmd/server/main.go

build-grpc:
	@printf $(COLOR) "Compiling gRPC..."
	rm -rf $(PROTO_OUT)
	mkdir -p $(PROTO_OUT)
	$(foreach PROTO_DIR,$(PROTO_DIRS),\
		protoc $(PROTO_IMPORTS) \
			--gogoslick_out=plugins=grpc,paths=source_relative,$(PROTO_REFS):$(PROTO_OUT) \
			--grpc-gateway_out=allow_patch_feature=false,paths=source_relative:$(PROTO_OUT) \
			--openapiv2_out=$(OPENAPI_OUT) \
		$(PROTO_DIR)*.proto \
	;)

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
