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

package server

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/temporalio/ui-server/v2/server/api"
	"github.com/temporalio/ui-server/v2/server/auth"
	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/cors"
	"github.com/temporalio/ui-server/v2/server/csrf"
	"github.com/temporalio/ui-server/v2/server/headers"
	"github.com/temporalio/ui-server/v2/server/route"
	"github.com/temporalio/ui-server/v2/server/server_options"

	"github.com/temporalio/ui-server/v2/ui"
)

type (
	// Server ui server.
	Server struct {
		httpServer  *echo.Echo
		options     *server_options.ServerOptions
		cfgProvider *config.ConfigProviderWithRefresh
	}
)

// NewServer returns a new instance of server that serves one or many services.
func NewServer(opts ...server_options.ServerOption) *Server {
	authMiddleware := server_options.WithAPIMiddleware(([]api.Middleware{
		headers.WithForwardHeaders(
			[]string{
				// NOTE: Authorization header is forwarded by grpc-gateway
				auth.AuthorizationExtrasHeader,
				"Caller-Type",
			}),
	}))

	opts = append(opts, authMiddleware)

	serverOpts := server_options.NewServerOptions(opts)
	cfgProvider, err := config.NewConfigProviderWithRefresh(serverOpts.ConfigProvider)
	if err != nil {
		panic(err)
	}
	cfg, err := cfgProvider.GetConfig()
	if err != nil {
		panic(err)
	}

	e := echo.New()
	e.HideBanner = cfg.HideLogs
	e.HidePort = cfg.HideLogs

	// Middleware
	if !cfg.HideLogs {
		e.Use(middleware.Logger())
	}
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(cors.CORSMiddleware(cors.CORSConfig{
		AllowHeaders: []string{
			echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept,
			echo.HeaderXCSRFToken, echo.HeaderAuthorization, auth.AuthorizationExtrasHeader,
			"Caller-Type",
		},
		AllowCredentials: true,
		ConfigProvider:   cfgProvider,
	}))
	e.Use(middleware.Secure())
	e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookiePath:     "/",
		CookieHTTPOnly: false,
		CookieSameSite: http.SameSiteStrictMode,
		CookieSecure:   !cfg.CORS.CookieInsecure,
		Skipper:        csrf.SkipOnAuthorizationHeader,
	}))

	e.Pre(route.PublicPath(cfg.PublicPath))
	route.SetHealthRoute(e)
	route.SetAPIRoutes(e, cfgProvider, serverOpts.APIMiddleware)
	route.SetAuthRoutes(e, cfgProvider)
	if cfg.EnableUI {
		var assets fs.FS
		if cfg.UIAssetPath != "" {
			assets = os.DirFS(cfg.UIAssetPath)
		} else {
			assets, err = ui.Assets()
			if err != nil {
				panic(err)
			}

			dir := "local"
			if cfg.CloudUI {
				dir = "cloud"
			}

			assets, err = fs.Sub(assets, dir)
			if err != nil {
				panic(err)
			}
		}
		route.SetUIRoutes(e, cfg.PublicPath, assets)
		route.SetRenderRoute(e)
	}

	s := &Server{
		httpServer:  e,
		options:     serverOpts,
		cfgProvider: cfgProvider,
	}
	return s
}

// Start UI server.
func (s *Server) Start() error {
	s.httpServer.Logger.Info("Starting UI server...")
	cfg, err := s.cfgProvider.GetConfig()
	if err != nil {
		return err
	}

	address := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	if cfg.UIServerTLS.CertFile != "" && cfg.UIServerTLS.KeyFile != "" {
		s.httpServer.Logger.Info("Starting UI server with TLS...")
		err = s.httpServer.StartTLS(address, cfg.UIServerTLS.CertFile, cfg.UIServerTLS.KeyFile)
	} else {
		err = s.httpServer.Start(address)
	}

	if err != http.ErrServerClosed {
		s.httpServer.Logger.Fatal(err)
	}
	return nil
}

// Stop UI server.
func (s *Server) Stop() {
	s.httpServer.Logger.Info("Stopping UI server...")
	if err := s.httpServer.Close(); err != nil {
		s.httpServer.Logger.Warn(err)
	}
}
