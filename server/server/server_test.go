package server

import (
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"

	"github.com/temporalio/ui-server/v2/server/auth"
)

func TestBuildForwardHeaders_AlwaysIncludesAuthorization(t *testing.T) {
	headers := buildForwardHeaders(nil)

	assert.Contains(t, headers, echo.HeaderAuthorization)
	assert.Contains(t, headers, auth.AuthorizationExtrasHeader)
	assert.Contains(t, headers, "Caller-Type")
}

func TestBuildForwardHeaders_AppendsConfigHeaders(t *testing.T) {
	extra := []string{"X-Custom-Header", "X-Tenant-ID"}
	headers := buildForwardHeaders(extra)

	assert.Contains(t, headers, echo.HeaderAuthorization)
	assert.Contains(t, headers, "X-Custom-Header")
	assert.Contains(t, headers, "X-Tenant-ID")
	assert.Len(t, headers, 5)
}

func TestBuildForwardHeaders_EmptyConfigHeaders(t *testing.T) {
	headers := buildForwardHeaders([]string{})

	assert.Len(t, headers, 3)
	assert.Contains(t, headers, echo.HeaderAuthorization)
}
