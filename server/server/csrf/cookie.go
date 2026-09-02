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
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/temporalio/ui-server/v2/server/config"
)

const (
	tokenCookieName   = "_csrf"
	tokenCookieMaxAge = 24 * time.Hour
)

// MiddlewareConfig returns the configuration for echo's CSRF middleware.
//
// It is paired with EnsureTokenCookie, which mints the cookie this configuration
// validates against; the two share the cookie attributes below and must be
// installed together, EnsureTokenCookie first.
func MiddlewareConfig(cfgProvider config.ConfigProvider, cookieSecure bool) middleware.CSRFConfig {
	return middleware.CSRFConfig{
		CookiePath:     "/",
		CookieHTTPOnly: false,
		CookieSameSite: http.SameSiteStrictMode,
		CookieSecure:   cookieSecure,
		Skipper:        SkipOnAuthorizationHeader,

		AllowSecFetchSiteFunc: AllowConfiguredCORSOrigins(cfgProvider),
	}
}

// EnsureTokenCookie issues the _csrf cookie that the UI reads and sends back as the
// X-CSRF-Token header.
//
// Echo's CSRF middleware stopped issuing it to browsers in v4.15.0: when a request
// carries a Sec-Fetch-Site header the middleware short-circuits before reaching its
// cookie-setting code, so only clients that omit the header (curl, other servers)
// ever receive one. Browsers always send it, which leaves the UI with no token —
// and every state-changing request rejected as soon as Sec-Fetch-Site is "same-site",
// which is the case whenever the UI and the API are served on different ports.
//
// This runs ahead of the CSRF middleware and mints the token itself when the request
// carries none, attaching it to the request as well as the response so that the CSRF
// middleware validates against the same value the browser was handed.
func EnsureTokenCookie(cookieSecure bool) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if _, err := c.Cookie(tokenCookieName); err == nil {
				return next(c)
			}

			token, err := generateToken()
			if err != nil {
				return err
			}

			cookie := &http.Cookie{
				Name:     tokenCookieName,
				Value:    token,
				Path:     "/",
				Expires:  time.Now().Add(tokenCookieMaxAge),
				Secure:   cookieSecure,
				HttpOnly: false,
				SameSite: http.SameSiteStrictMode,
			}
			c.SetCookie(cookie)
			c.Request().AddCookie(cookie)

			return next(c)
		}
	}
}

func generateToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil
}
