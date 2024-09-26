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

package route

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/temporalio/ui-server/v2/server/api"
	"github.com/temporalio/ui-server/v2/server/config"
)

func DisableWriteMiddleware(cfgProvider *config.ConfigProviderWithRefresh) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cfg, err := cfgProvider.GetConfig()
			if err != nil {
				return c.JSON(http.StatusInternalServerError, err)
			}

			if cfg.DisableWriteActions && c.Request().Method != http.MethodGet {
				return echo.ErrMethodNotAllowed
			}

			return next(c)
		}
	}
}

// SetAPIRoutes sets api routes
func SetAPIRoutes(e *echo.Echo, cfgProvider *config.ConfigProviderWithRefresh, apiMiddleware []api.Middleware) error {

	route := e.Group("/api/v1")
	route.GET("/settings", api.GetSettings(cfgProvider))

	writeControlMiddleware := DisableWriteMiddleware(cfgProvider)
	conn, err := api.CreateGRPCConnection(cfgProvider)

	if err != nil {
		return fmt.Errorf("Failed to create gRPC connection to Temporal server: %w", err)
	}

	route.Match([]string{"GET", "POST", "PUT", "PATCH", "DELETE"}, "/*", api.TemporalAPIHandler(cfgProvider, apiMiddleware, conn), writeControlMiddleware)

	// New api paths with removed prefix. Need to figure out how to handle when ui and ui server are on same host
	// e.GET("/settings", api.GetSettings(cfgProvider))
	// e.GET("/cluster", api.TemporalAPIHandler(cfgProvider, apiMiddleware, conn), writeControlMiddleware)
	// e.GET("/system-info", api.TemporalAPIHandler(cfgProvider, apiMiddleware, conn), writeControlMiddleware)

	// cluster := e.Group("/cluster")
	// cluster.Match([]string{"GET", "POST", "PUT", "PATCH", "DELETE"}, "/*", api.TemporalAPIHandler(cfgProvider, apiMiddleware, conn), writeControlMiddleware)

	// namespaces := e.Group("/namespaces")
	// namespaces.Match([]string{"GET", "POST", "PUT", "PATCH", "DELETE"}, "/*", api.TemporalAPIHandler(cfgProvider, apiMiddleware, conn), writeControlMiddleware)

	return nil
}
