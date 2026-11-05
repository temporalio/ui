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
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"os"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"github.com/temporalio/ui-server/v2/server/api"
	"github.com/temporalio/ui-server/v2/server/auth"
	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/cors"
	"github.com/temporalio/ui-server/v2/server/csrf"
	"github.com/temporalio/ui-server/v2/server/headers"
	"github.com/temporalio/ui-server/v2/server/route"
	"github.com/temporalio/ui-server/v2/server/server_options"
	"github.com/temporalio/ui-server/v2/server/tlsutil"

	"github.com/temporalio/ui-server/v2/ui"
)

type (
	// Server ui server.
	Server struct {
		httpServer  *echo.Echo
		options     *server_options.ServerOptions
		cfgProvider *config.ConfigProviderWithRefresh
		// stopCtx is cancelled by Stop to shut the HTTP server down.
		stopCtx context.Context
		stop    context.CancelFunc
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
	if cfg.HideLogs {
		e.Logger = slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelError}))
	}

	// Middleware
	if !cfg.HideLogs {
		e.Use(middleware.RequestLogger())
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
	csrfCookieSecure := !cfg.CORS.CookieInsecure
	e.Use(csrf.EnsureTokenCookie(csrfCookieSecure))
	e.Use(middleware.CSRFWithConfig(csrf.MiddlewareConfig(cfgProvider, csrfCookieSecure)))

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
		route.SetUIRoutes(e, cfg.PublicPath, assets, cfgProvider)
		route.SetRenderRoute(e, "/")
	}

	stopCtx, stop := context.WithCancel(context.Background())
	s := &Server{
		httpServer:  e,
		options:     serverOpts,
		cfgProvider: cfgProvider,
		stopCtx:     stopCtx,
		stop:        stop,
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

	startConfig := echo.StartConfig{
		Address:    fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		HideBanner: cfg.HideLogs,
		HidePort:   cfg.HideLogs,
	}
	tlsMode, err := cfg.UIServerTLS.Mode()
	if err != nil {
		return err
	}
	switch tlsMode {
	case config.ModeMutual:
		s.httpServer.Logger.Info("Starting UI server with mTLS...")
		tlsConfig, buildErr := buildMTLSConfig(cfg.UIServerTLS.CertFile, cfg.UIServerTLS.KeyFile, *cfg.UIServerTLS.MTLS)
		if buildErr != nil {
			return buildErr
		}
		// StartTLS doesn't allow us to specify the CA, or get the cert reload behavior, set the TLS config manually.
		startConfig.TLSConfig = tlsConfig
		err = startConfig.Start(s.stopCtx, s.httpServer)
	case config.ModeStandard:
		s.httpServer.Logger.Info("Starting UI server with TLS...")
		// StartTLS reads through an fs.FS, which rejects absolute paths, and offers only h2.
		cert, loadErr := tls.LoadX509KeyPair(cfg.UIServerTLS.CertFile, cfg.UIServerTLS.KeyFile)
		if loadErr != nil {
			return loadErr
		}
		startConfig.TLSConfig = &tls.Config{
			MinVersion:   tls.VersionTLS12,
			NextProtos:   []string{"h2", "http/1.1"},
			Certificates: []tls.Certificate{cert},
		}
		err = startConfig.Start(s.stopCtx, s.httpServer)
	case config.ModeNone:
		err = startConfig.Start(s.stopCtx, s.httpServer)
	case config.ModeUnknown:
		err = errors.New("could not determine valid TLS mode from config")
	default:
		err = fmt.Errorf("unsupported TLS mode: %s", tlsMode)
	}

	if err != nil && !errors.Is(err, http.ErrServerClosed) && !errors.Is(err, context.Canceled) {
		s.httpServer.Logger.Error("UI server failed", "error", err)
		return err
	}
	return nil
}

// buildMTLSConfig provides an mTLS configuration based on the provided configuration. The server cert
// is hot-reloaded from disk, allowing for cert rotation without restarting the server.
func buildMTLSConfig(certFile, keyFile string, mtls config.UIServerMTLS) (*tls.Config, error) {
	loader := tlsutil.NewCertLoader(certFile, keyFile)
	if _, err := loader.GetCertificate(nil); err != nil {
		return nil, fmt.Errorf("error load initial ui-server key pair: %w", err)
	}

	caBytes, err := os.ReadFile(mtls.CaFile)
	if err != nil {
		return nil, fmt.Errorf("error reading client CA %q: %w", mtls.CaFile, err)
	}
	pool := x509.NewCertPool()
	if !pool.AppendCertsFromPEM(caBytes) {
		return nil, fmt.Errorf("no valid PEM certificates in %q", mtls.CaFile)
	}

	clientAuth, err := mtls.ClientAuthType()
	if err != nil {
		return nil, err
	}

	return &tls.Config{
		MinVersion:     tls.VersionTLS12,
		NextProtos:     []string{"h2", "http/1.1"},
		GetCertificate: loader.GetCertificate,
		ClientAuth:     clientAuth,
		ClientCAs:      pool,
	}, nil
}

// Stop UI server.
func (s *Server) Stop() {
	s.httpServer.Logger.Info("Stopping UI server...")
	s.stop()
}
