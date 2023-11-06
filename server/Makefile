.ONESHELL:
.PHONY:

all: build

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

##### Test #####
test: clean-test-results
	@printf $(COLOR) "Running unit tests..."
	go test ./... -race

clean-test-results:
	@rm -f test.log
	@go clean -testcache
