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
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func csrfCookie(t *testing.T, rec *httptest.ResponseRecorder) *http.Cookie {
	t.Helper()

	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == tokenCookieName {
			return cookie
		}
	}

	return nil
}

// TestEnsureTokenCookieIssuesCookieToBrowsers is the regression this middleware
// exists for. Echo v4.15.0 stopped setting the CSRF cookie whenever a request
// carries Sec-Fetch-Site, which is every browser request, leaving the UI with no
// token to send back.
func TestEnsureTokenCookieIssuesCookieToBrowsers(t *testing.T) {
	for _, secFetchSite := range []string{"", "none", "same-origin", "same-site", "cross-site"} {
		name := secFetchSite
		if name == "" {
			name = "no sec-fetch-site header"
		}

		t.Run(name, func(t *testing.T) {
			e := echo.New()
			e.Use(EnsureTokenCookie(true))
			e.Use(middleware.CSRFWithConfig(MiddlewareConfig(corsConfig([]string{"https://ui.example"}, false), true)))
			e.GET("/healthz", func(c echo.Context) error {
				return c.NoContent(http.StatusOK)
			})

			req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
			if secFetchSite != "" {
				req.Header.Set(echo.HeaderSecFetchSite, secFetchSite)
			}

			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			require.Equal(t, http.StatusOK, rec.Code)

			cookie := csrfCookie(t, rec)
			require.NotNil(t, cookie, "no %s cookie was issued", tokenCookieName)
			assert.NotEmpty(t, cookie.Value)
			assert.Equal(t, "/", cookie.Path)
			assert.True(t, cookie.Secure)
			assert.False(t, cookie.HttpOnly, "the UI reads this cookie from document.cookie")
			assert.Equal(t, http.SameSiteStrictMode, cookie.SameSite)
		})
	}
}

func TestEnsureTokenCookieKeepsExistingToken(t *testing.T) {
	const token = "0123456789abcdef0123456789abcdef"

	e := echo.New()
	e.Use(EnsureTokenCookie(true))
	e.GET("/healthz", func(c echo.Context) error {
		cookie, err := c.Cookie(tokenCookieName)
		require.NoError(t, err)
		assert.Equal(t, token, cookie.Value)

		return c.NoContent(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	req.AddCookie(&http.Cookie{Name: tokenCookieName, Value: token})

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Nil(t, csrfCookie(t, rec), "an existing token should not be replaced")
}

func TestEnsureTokenCookieHonorsCookieInsecure(t *testing.T) {
	e := echo.New()
	e.Use(EnsureTokenCookie(false))
	e.GET("/healthz", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	cookie := csrfCookie(t, rec)
	require.NotNil(t, cookie)
	assert.False(t, cookie.Secure)
}

// TestBrowserRoundTrip walks the flow the UI actually performs: load a page, read
// the _csrf cookie out of the response, then send it back as X-CSRF-Token on a
// write. The "same-site" case is local development and docker-compose, where the
// UI and the API sit on different ports.
func TestBrowserRoundTrip(t *testing.T) {
	tests := map[string]struct {
		secFetchSite string
		origin       string
		expectStatus int
	}{
		"same-origin":                    {secFetchSite: "same-origin", expectStatus: http.StatusOK},
		"same-site (ui and api ports)":   {secFetchSite: "same-site", origin: "http://localhost:3000", expectStatus: http.StatusOK},
		"cross-site from allowed origin": {secFetchSite: "cross-site", origin: "https://ui.example", expectStatus: http.StatusOK},
		"cross-site from other origin":   {secFetchSite: "cross-site", origin: "https://evil.example", expectStatus: http.StatusForbidden},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			e := echo.New()
			e.Use(EnsureTokenCookie(false))
			e.Use(middleware.CSRFWithConfig(MiddlewareConfig(corsConfig([]string{"https://ui.example"}, false), false)))
			e.GET("/", func(c echo.Context) error { return c.NoContent(http.StatusOK) })
			e.POST("/api/v1/*", func(c echo.Context) error { return c.NoContent(http.StatusOK) })

			// 1. The browser loads the UI and is handed a token.
			pageReq := httptest.NewRequest(http.MethodGet, "/", nil)
			pageReq.Header.Set(echo.HeaderSecFetchSite, tt.secFetchSite)
			pageRec := httptest.NewRecorder()
			e.ServeHTTP(pageRec, pageReq)

			cookie := csrfCookie(t, pageRec)
			require.NotNil(t, cookie, "the UI was never handed a CSRF token")

			// 2. The UI reads it from document.cookie and sends it back on a write.
			writeReq := httptest.NewRequest(http.MethodPost, "/api/v1/namespaces/default/workflows", nil)
			writeReq.AddCookie(cookie)
			writeReq.Header.Set(echo.HeaderXCSRFToken, cookie.Value)
			writeReq.Header.Set(echo.HeaderSecFetchSite, tt.secFetchSite)
			if tt.origin != "" {
				writeReq.Header.Set(echo.HeaderOrigin, tt.origin)
			}

			writeRec := httptest.NewRecorder()
			e.ServeHTTP(writeRec, writeReq)

			assert.Equal(t, tt.expectStatus, writeRec.Code)
		})
	}
}
