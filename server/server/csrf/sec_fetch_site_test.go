// The MIT License
//
// Copyright (c) 2020 Temporal Technologies Inc.  All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

package csrf

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/temporalio/ui-server/v2/server/config"
)

type failingConfigProvider struct{}

func (failingConfigProvider) GetConfig() (*config.Config, error) {
	return nil, errors.New("config unavailable")
}

func corsConfig(allowOrigins []string, unsafeAllowAll bool) *config.Config {
	cfg := &config.Config{}
	cfg.CORS.AllowOrigins = allowOrigins
	cfg.CORS.UnsafeAllowAllOrigins = unsafeAllowAll

	return cfg
}

func TestAllowConfiguredCORSOrigins(t *testing.T) {
	tests := map[string]struct {
		cfgProvider  config.ConfigProvider
		secFetchSite string
		origin       string
		expectBlock  bool
	}{
		"cross-site from allowed origin falls through to token validation": {
			cfgProvider:  corsConfig([]string{"https://ui.example"}, false),
			secFetchSite: "cross-site",
			origin:       "https://ui.example",
		},
		"cross-site with wildcard allow list falls through to token validation": {
			cfgProvider:  corsConfig([]string{"*"}, false),
			secFetchSite: "cross-site",
			origin:       "https://ui.example",
		},
		"cross-site with unsafeAllowAllOrigins falls through to token validation": {
			cfgProvider:  corsConfig(nil, true),
			secFetchSite: "cross-site",
			origin:       "https://anything.example",
		},
		"same-site keeps echo's fallback regardless of origin": {
			cfgProvider:  corsConfig([]string{"https://ui.example"}, false),
			secFetchSite: "same-site",
			origin:       "http://localhost:3000",
		},
		"cross-site from a disallowed origin is blocked": {
			cfgProvider:  corsConfig([]string{"https://ui.example"}, false),
			secFetchSite: "cross-site",
			origin:       "https://evil.example",
			expectBlock:  true,
		},
		"cross-site without an origin header is blocked": {
			cfgProvider:  corsConfig([]string{"https://ui.example"}, false),
			secFetchSite: "cross-site",
			expectBlock:  true,
		},
		"cross-site is blocked when the config cannot be read": {
			cfgProvider:  failingConfigProvider{},
			secFetchSite: "cross-site",
			origin:       "https://ui.example",
			expectBlock:  true,
		},
		"same-site is allowed through when the config cannot be read": {
			cfgProvider:  failingConfigProvider{},
			secFetchSite: "same-site",
			origin:       "https://ui.example",
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodPost, "/api/v1/namespaces/default/workflows", nil)
			req.Header.Set(echo.HeaderSecFetchSite, tt.secFetchSite)
			if tt.origin != "" {
				req.Header.Set(echo.HeaderOrigin, tt.origin)
			}

			allow, err := AllowConfiguredCORSOrigins(tt.cfgProvider)(e.NewContext(req, httptest.NewRecorder()))

			// The function never pre-approves a request; it either defers to token
			// validation or blocks outright.
			assert.False(t, allow)

			if !tt.expectBlock {
				assert.NoError(t, err)
				return
			}

			var httpErr *echo.HTTPError
			require.ErrorAs(t, err, &httpErr)
			assert.Equal(t, http.StatusForbidden, httpErr.Code)
		})
	}
}

// TestCSRFMiddlewareWithSecFetchSite exercises the real echo CSRF middleware wired
// the way server.NewServer wires it, to pin the behavior the AllowSecFetchSiteFunc
// is there to preserve: a valid CSRF token is enough for a cross-site request from
// a configured origin, and is not enough for any other cross-site request.
func TestCSRFMiddlewareWithSecFetchSite(t *testing.T) {
	const token = "0123456789abcdef0123456789abcdef"

	tests := map[string]struct {
		secFetchSite string
		origin       string
		sentToken    string
		expectStatus int
	}{
		"same-origin":                      {secFetchSite: "same-origin", expectStatus: http.StatusOK},
		"same-site with token":             {secFetchSite: "same-site", expectStatus: http.StatusOK},
		"no sec-fetch-site with token":     {expectStatus: http.StatusOK},
		"cross-site allowed origin":        {secFetchSite: "cross-site", origin: "https://ui.example", expectStatus: http.StatusOK},
		"cross-site disallowed origin":     {secFetchSite: "cross-site", origin: "https://evil.example", expectStatus: http.StatusForbidden},
		"cross-site without origin header": {secFetchSite: "cross-site", expectStatus: http.StatusForbidden},

		// An allowed origin defers to token validation, it does not bypass CSRF.
		"cross-site allowed origin with a bad token": {secFetchSite: "cross-site", origin: "https://ui.example", sentToken: "wrong", expectStatus: http.StatusForbidden},
		"same-site with a bad token":                 {secFetchSite: "same-site", sentToken: "wrong", expectStatus: http.StatusForbidden},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			e := echo.New()
			e.Use(middleware.CSRFWithConfig(MiddlewareConfig(corsConfig([]string{"https://ui.example"}, false), false)))
			e.POST("/api/v1/*", func(c echo.Context) error {
				return c.NoContent(http.StatusOK)
			})

			sentToken := tt.sentToken
			if sentToken == "" {
				sentToken = token
			}

			req := httptest.NewRequest(http.MethodPost, "/api/v1/namespaces/default/workflows", nil)
			req.AddCookie(&http.Cookie{Name: "_csrf", Value: token})
			req.Header.Set(echo.HeaderXCSRFToken, sentToken)
			if tt.secFetchSite != "" {
				req.Header.Set(echo.HeaderSecFetchSite, tt.secFetchSite)
			}
			if tt.origin != "" {
				req.Header.Set(echo.HeaderOrigin, tt.origin)
			}

			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			assert.Equal(t, tt.expectStatus, rec.Code)
		})
	}
}

// TestCSRFMiddlewareSkipsOnAuthorizationHeader confirms the Skipper still runs
// before the Sec-Fetch-Site check, so authenticated cross-site API calls are
// unaffected by the echo v4.15.0 CSRF changes.
func TestCSRFMiddlewareSkipsOnAuthorizationHeader(t *testing.T) {
	e := echo.New()
	e.Use(middleware.CSRFWithConfig(MiddlewareConfig(corsConfig(nil, false), false)))
	e.POST("/api/v1/*", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/namespaces/default/workflows", nil)
	req.Header.Set(echo.HeaderSecFetchSite, "cross-site")
	req.Header.Set(echo.HeaderOrigin, "https://evil.example")
	req.Header.Set(echo.HeaderAuthorization, "Bearer xxx")

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
}
