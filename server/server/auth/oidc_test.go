package auth_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/temporalio/ui-server/v2/server/auth"
	"golang.org/x/oauth2"
)

func newCallbackRequest(state string, query url.Values) *http.Request {
	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?"+query.Encode(), nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: state})
	return req
}

func newOAuthConfig(t *testing.T) *oauth2.Config {
	tokenServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Errorf("token endpoint must not be called, got %s %s", r.Method, r.URL.Path)
		http.Error(w, "unexpected token exchange", http.StatusInternalServerError)
	}))
	t.Cleanup(tokenServer.Close)

	return &oauth2.Config{
		ClientID:     "client-id",
		ClientSecret: "client-secret",
		Endpoint: oauth2.Endpoint{
			AuthURL:  tokenServer.URL + "/auth",
			TokenURL: tokenServer.URL + "/token",
		},
	}
}

func requireHTTPError(t *testing.T, err error) *echo.HTTPError {
	t.Helper()
	var httpErr *echo.HTTPError
	require.True(t, errors.As(err, &httpErr), "expected *echo.HTTPError, got %T: %v", err, err)
	return httpErr
}

func TestExchangeCodeSurfacesProviderError(t *testing.T) {
	query := url.Values{
		"state":             {"expected-state"},
		"error":             {"invalid_scope"},
		"error_description": {"Invalid scopes: openid offline_access"},
	}

	user, err := auth.ExchangeCode(context.Background(), newCallbackRequest("expected-state", query), newOAuthConfig(t), nil)

	assert.Nil(t, user)
	httpErr := requireHTTPError(t, err)
	assert.Equal(t, http.StatusUnauthorized, httpErr.Code)
	assert.Equal(t, "SSO provider returned an error: invalid_scope - Invalid scopes: openid offline_access", httpErr.Message)
}

func TestExchangeCodeSurfacesProviderErrorWithoutDescription(t *testing.T) {
	query := url.Values{
		"state": {"expected-state"},
		"error": {"access_denied"},
	}

	_, err := auth.ExchangeCode(context.Background(), newCallbackRequest("expected-state", query), newOAuthConfig(t), nil)

	httpErr := requireHTTPError(t, err)
	assert.Equal(t, http.StatusUnauthorized, httpErr.Code)
	assert.Equal(t, "SSO provider returned an error: access_denied", httpErr.Message)
}

func TestExchangeCodeChecksStateBeforeProviderError(t *testing.T) {
	query := url.Values{
		"state": {"forged-state"},
		"error": {"access_denied"},
	}

	_, err := auth.ExchangeCode(context.Background(), newCallbackRequest("expected-state", query), newOAuthConfig(t), nil)

	httpErr := requireHTTPError(t, err)
	assert.Equal(t, http.StatusBadRequest, httpErr.Code)
	assert.Equal(t, "State cookie did not match", httpErr.Message)
}

func TestExchangeCodeRejectsMissingCode(t *testing.T) {
	query := url.Values{
		"state": {"expected-state"},
	}

	_, err := auth.ExchangeCode(context.Background(), newCallbackRequest("expected-state", query), newOAuthConfig(t), nil)

	httpErr := requireHTTPError(t, err)
	assert.Equal(t, http.StatusBadRequest, httpErr.Code)
	assert.Equal(t, "Authorization code is missing from the SSO callback", httpErr.Message)
}
