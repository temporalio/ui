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

	"github.com/labstack/echo/v4"

	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/cors"
)

const secFetchSiteSameSite = "same-site"

// AllowConfiguredCORSOrigins builds the AllowSecFetchSiteFunc for echo's CSRF
// middleware. Echo only calls it for state-changing requests whose Sec-Fetch-Site
// is "same-site" or "cross-site"; safe methods, "same-origin", "none" and requests
// without the header are resolved before this is reached.
//
// Echo's default is to reject every cross-site request outright, before any token
// is looked at. That would break deployments serving the UI from a separate origin
// listed in cors.allowOrigins, so those requests fall through to X-CSRF-Token
// validation instead, which is how they were handled before echo v4.15.0.
//
// Returning (false, nil) means "not pre-approved, validate the token" rather than
// "allow": the token check still gates the request.
func AllowConfiguredCORSOrigins(cfgProvider config.ConfigProvider) func(echo.Context) (bool, error) {
	return func(c echo.Context) (bool, error) {
		if c.Request().Header.Get(echo.HeaderSecFetchSite) == secFetchSiteSameSite {
			// Echo's own fallback for same-site requests.
			return false, nil
		}

		if originAllowedByCORS(c, cfgProvider) {
			return false, nil
		}

		return false, echo.NewHTTPError(http.StatusForbidden, "cross-site request blocked by CSRF")
	}
}

// originAllowedByCORS reports whether the request carries an Origin that the CORS
// configuration permits. Config is read per request so that changes picked up by
// config.ConfigProviderWithRefresh take effect, matching cors.CORSMiddleware.
func originAllowedByCORS(c echo.Context, cfgProvider config.ConfigProvider) bool {
	cfg, err := cfgProvider.GetConfig()
	if err != nil {
		return false
	}

	origin := c.Request().Header.Get(echo.HeaderOrigin)
	if origin == "" {
		return false
	}

	return cfg.CORS.UnsafeAllowAllOrigins || cors.IsOriginAllowed(origin, cfg.CORS.AllowOrigins)
}
