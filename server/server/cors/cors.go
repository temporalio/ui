// The MIT License
//
// Copyright (c) 2022 Temporal Technologies Inc.  All rights reserved.
//
// Copyright (c) 2020 Uber Technologies, Inc.
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

package cors

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/config"
)

// CORSConfig holds the configuration for CORS middleware
type CORSConfig struct {
	AllowHeaders     []string
	AllowCredentials bool
	ConfigProvider   config.ConfigProvider
}

// CORSMiddleware creates a performant CORS middleware that dynamically handles
// unsafe allow all origins configuration
func CORSMiddleware(config CORSConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cfg, err := config.ConfigProvider.GetConfig()
			if err != nil {
				return next(c)
			}

			// Early return if unsafe allow all origins is not enabled
			if !cfg.CORS.UnsafeAllowAllOrigins {
				// Use static allowed origins
				return handleStaticCORS(c, next, cfg.CORS.AllowOrigins, config)
			}

			// Handle dynamic CORS for unsafe allow all origins
			return handleDynamicCORS(c, next, config)
		}
	}
}

// handleStaticCORS handles standard CORS with predefined allowed origins
func handleStaticCORS(c echo.Context, next echo.HandlerFunc, allowOrigins []string, config CORSConfig) error {
	origin := c.Request().Header.Get("Origin")
	
	// Check if origin is in allowed list
	allowed := false
	for _, allowedOrigin := range allowOrigins {
		if allowedOrigin == origin || allowedOrigin == "*" {
			allowed = true
			break
		}
	}

	if allowed {
		setCORSHeaders(c, origin, config)
	}

	// Handle preflight requests
	if c.Request().Method == http.MethodOptions {
		return c.NoContent(http.StatusNoContent)
	}

	return next(c)
}

// handleDynamicCORS handles unsafe allow all origins by using the request origin
func handleDynamicCORS(c echo.Context, next echo.HandlerFunc, config CORSConfig) error {
	origin := c.Request().Header.Get("Origin")
	
	// Only set CORS headers if origin is present
	if origin != "" {
		setCORSHeaders(c, origin, config)
	}

	// Handle preflight requests
	if c.Request().Method == http.MethodOptions {
		return c.NoContent(http.StatusNoContent)
	}

	return next(c)
}

// setCORSHeaders sets the appropriate CORS headers
func setCORSHeaders(c echo.Context, origin string, config CORSConfig) {
	c.Response().Header().Set("Access-Control-Allow-Origin", origin)
	
	if config.AllowCredentials {
		c.Response().Header().Set("Access-Control-Allow-Credentials", "true")
	}
	
	if len(config.AllowHeaders) > 0 {
		c.Response().Header().Set("Access-Control-Allow-Headers", strings.Join(config.AllowHeaders, ", "))
	}
	
	c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
}