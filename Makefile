.ONESHELL:
.PHONY:

all: clean install build

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
PROTO_OUT := ./src/types
PROTO_IMPORTS := \
	-I $(PROTO_ROOT)
PROTO_REFS := Mgoogle/protobuf/wrappers.proto=github.com/gogo/protobuf/types,Mgoogle/protobuf/duration.proto=github.com/gogo/protobuf/types,Mgoogle/protobuf/empty.proto=github.com/gogo/protobuf/types,Mgoogle/protobuf/descriptor.proto=github.com/gogo/protobuf/protoc-gen-gogo/descriptor,Mgoogle/protobuf/timestamp.proto=github.com/gogo/protobuf/types,Mgoogle/api/annotations.proto=github.com/gogo/googleapis/google/api

##### Install dependencies #####
install: install-submodules

install-submodules:
	printf $(COLOR) "fetching submudules..."
	git submodule update --init

##### Build #####
build: build-types

build-types:
	printf $(COLOR) "Compiling Typescript types..."
	rm -rf $(PROTO_OUT)/*
	mkdir -p $(PROTO_OUT)
	$(foreach PROTO_DIR,$(PROTO_DIRS),\
		protoc $(PROTO_IMPORTS) \
			--plugin=node_modules/ts-proto/protoc-gen-ts_proto \
			--ts_proto_out=esModuleInterop=true,$(PROTO_REFS):$(PROTO_OUT) \
		$(PROTO_DIR)*.proto \
	;)

clean:
	rm -rf $(PROTO_OUT)
