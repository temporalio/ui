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

##### Build #####
build: clean build-types

build-types: install-tools
	git submodule update --init
	printf $(COLOR) "Compiling Typescript types..."
	rm -rf $(PROTO_OUT)/*
	mkdir -p $(PROTO_OUT)
	$(foreach PROTO_DIR,$(PROTO_DIRS),\
		protoc $(PROTO_IMPORTS) \
			--ts_out=$(PROTO_REFS):$(PROTO_OUT) \
		$(PROTO_DIR)*.proto \
	;)

clean:
	rm -rf ./src/types

##### Install dependencies #####
install: install-tools

install-tools:
	npm install -g protoc-gen-ts