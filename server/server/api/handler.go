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

package api

import (
	"fmt"
	"net/http"
	"net/http/httptest"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/context"
	"google.golang.org/grpc"

	"github.com/temporalio/ui-server/v2/server/auth"
	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/rpc"
	"github.com/temporalio/ui-server/v2/server/version"
	"go.temporal.io/api/operatorservice/v1"
	"go.temporal.io/api/serviceerror"
	"go.temporal.io/api/temporalproto"
	"go.temporal.io/api/workflowservice/v1"

	// DO NOT REMOVE
	_ "go.temporal.io/api/temporalproto"
)

type Auth struct {
	Enabled            bool
	Options            []string
	RedirectToProvider bool
}

type CodecResponse struct {
	Endpoint            string
	PassAccessToken     bool
	IncludeCredentials  bool
	DefaultErrorMessage string
	DefaultErrorLink    string
}

type SettingsResponse struct {
	Auth                          *Auth
	DefaultNamespace              string
	ShowTemporalSystemNamespace   bool
	NavCollapsedByDefault         bool
	FeedbackURL                   string
	Codec                         *CodecResponse
	CustomUI                      *CustomUISettingsResponse
	Version                       string
	DisableWriteActions           bool
	WorkflowTerminateDisabled     bool
	WorkflowCancelDisabled        bool
	WorkflowSignalDisabled        bool
	WorkflowUpdateDisabled        bool
	WorkflowResetDisabled         bool
	WorkflowPauseDisabled         bool
	BatchActionsDisabled          bool
	StartWorkflowDisabled         bool
	HideWorkflowQueryErrors       bool
	RefreshWorkflowCountsDisabled bool
	ActivityCommandsDisabled      bool
}

type CustomUISettingsResponse struct {
	Enabled bool
}

type CustomUIResponse struct {
	Enabled          bool
	IframeExtensions []IframeExtensionResponse
}

type IframeExtensionResponse struct {
	ID            string
	Title         string
	Slot          string
	Src           string
	AllowedOrigin string
	RoutePatterns []string
	Sandbox       IframeSandboxResponse
	Sizing        IframeExtensionSizingResponse
	Permissions   []string
}

type IframeSandboxResponse struct {
	AllowDownloads  bool
	AllowForms      bool
	AllowModals     bool
	AllowPopups     bool
	AllowSameOrigin bool
}

type IframeExtensionSizingResponse struct {
	DefaultHeight int
	MinHeight     int
	MaxHeight     int
	DefaultWidth  int
	MinWidth      int
	MaxWidth      int
}

type AccessCheck func(echo.Context) error

func TemporalAPIHandler(cfgProvider *config.ConfigProviderWithRefresh, apiMiddleware []Middleware, conn *grpc.ClientConn) echo.HandlerFunc {
	return func(c echo.Context) error {
		err := auth.ValidateAuthHeaderExists(c, cfgProvider)
		if err != nil {
			return err
		}

		mux, err := getTemporalClientMux(c, conn, apiMiddleware)
		if err != nil {
			return err
		}

		mux.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func CreateGRPCConnection(cfgProvider *config.ConfigProviderWithRefresh) (*grpc.ClientConn, error) {
	cfg, err := cfgProvider.GetConfig()
	if err != nil {
		return nil, err
	}

	tls, err := rpc.CreateTLSConfig(cfg.TemporalGRPCAddress, &cfg.TLS)
	if err != nil {
		return nil, fmt.Errorf("Unable to read TLS configs: %w", err)
	}

	conn := rpc.CreateGRPCConnection(cfg.TemporalGRPCAddress, tls)
	return conn, nil
}

func customUIResponse(customUI config.CustomUI) *CustomUIResponse {
	if !customUI.Enabled {
		return &CustomUIResponse{
			Enabled:          false,
			IframeExtensions: []IframeExtensionResponse{},
		}
	}

	iframeExtensions := make([]IframeExtensionResponse, 0, len(customUI.IframeExtensions))
	for _, extension := range customUI.IframeExtensions {
		iframeExtensions = append(iframeExtensions, IframeExtensionResponse{
			ID:            extension.ID,
			Title:         extension.Title,
			Slot:          extension.Slot,
			Src:           extension.Src,
			AllowedOrigin: extension.AllowedOrigin,
			RoutePatterns: extension.RoutePatterns,
			Sandbox: IframeSandboxResponse{
				AllowDownloads:  extension.Sandbox.AllowDownloads,
				AllowForms:      extension.Sandbox.AllowForms,
				AllowModals:     extension.Sandbox.AllowModals,
				AllowPopups:     extension.Sandbox.AllowPopups,
				AllowSameOrigin: extension.Sandbox.AllowSameOrigin,
			},
			Sizing: IframeExtensionSizingResponse{
				DefaultHeight: extension.Sizing.DefaultHeight,
				MinHeight:     extension.Sizing.MinHeight,
				MaxHeight:     extension.Sizing.MaxHeight,
				DefaultWidth:  extension.Sizing.DefaultWidth,
				MinWidth:      extension.Sizing.MinWidth,
				MaxWidth:      extension.Sizing.MaxWidth,
			},
			Permissions: extension.Permissions,
		})
	}

	return &CustomUIResponse{
		Enabled:          customUI.Enabled,
		IframeExtensions: iframeExtensions,
	}
}

// TemporalAccessCheck verifies the request against the same Temporal API
// authority used by the rest of the application. This is required in addition
// to the local header/JWT check because supported custom-auth deployments rely
// on Temporal's claim mapper and authorizer to validate access tokens.
func TemporalAccessCheck(conn *grpc.ClientConn, apiMiddleware []Middleware) AccessCheck {
	return func(c echo.Context) error {
		mux, err := getTemporalClientMux(c, conn, apiMiddleware)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadGateway, "unable to verify Temporal API access").SetInternal(err)
		}

		request := c.Request().Clone(c.Request().Context())
		request.Method = http.MethodGet
		request.URL.Path = "/api/v1/system-info"
		request.URL.RawPath = ""
		request.URL.RawQuery = ""
		request.RequestURI = request.URL.RequestURI()
		request.Body = nil
		request.ContentLength = 0

		response := httptest.NewRecorder()
		mux.ServeHTTP(response, request)
		if response.Code >= http.StatusOK && response.Code < http.StatusMultipleChoices {
			return nil
		}
		if response.Code == http.StatusUnauthorized || response.Code == http.StatusForbidden {
			return echo.NewHTTPError(response.Code, "unauthorized")
		}
		return echo.NewHTTPError(http.StatusBadGateway, "unable to verify Temporal API access")
	}
}

// GetUIExtensions returns the effective inline extension registry. Unlike the
// public bootstrap settings, this endpoint verifies access through the same
// Temporal API authority when authentication is enabled.
func GetUIExtensions(cfgProvider *config.ConfigProviderWithRefresh, accessCheck AccessCheck) func(echo.Context) error {
	return func(c echo.Context) error {
		c.Response().Header().Set("Cache-Control", "no-store")
		c.Response().Header().Set("Vary", echo.HeaderAuthorization)

		if err := auth.ValidateAuthHeaderExists(c, cfgProvider); err != nil {
			return err
		}

		cfg, err := cfgProvider.GetConfig()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		if cfg.Auth.Enabled {
			if accessCheck == nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "UI extension authorization is not configured")
			}
			if err := accessCheck(c); err != nil {
				return err
			}
		}
		if err := cfg.CustomUI.Validate(cfg.Auth.Enabled); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "invalid custom UI configuration").SetInternal(err)
		}

		return c.JSON(http.StatusOK, customUIResponse(cfg.CustomUI))
	}
}

func GetSettings(cfgProvider *config.ConfigProviderWithRefresh) func(echo.Context) error {
	return func(c echo.Context) error {
		cfg, err := cfgProvider.GetConfig()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}

		var options []string
		if len(cfg.Auth.Providers) != 0 {
			authProviderCfg := cfg.Auth.Providers[0].Options
			for k := range authProviderCfg {
				options = append(options, k)
			}
		}

		settings := &SettingsResponse{
			Auth: &Auth{
				Enabled:            cfg.Auth.Enabled,
				Options:            options,
				RedirectToProvider: cfg.Auth.RedirectToProvider,
			},
			DefaultNamespace:            cfg.DefaultNamespace,
			ShowTemporalSystemNamespace: cfg.ShowTemporalSystemNamespace,
			NavCollapsedByDefault:       cfg.NavCollapsedByDefault,
			FeedbackURL:                 cfg.FeedbackURL,
			Codec: &CodecResponse{
				Endpoint:            cfg.Codec.Endpoint,
				PassAccessToken:     cfg.Codec.PassAccessToken,
				IncludeCredentials:  cfg.Codec.IncludeCredentials,
				DefaultErrorMessage: cfg.Codec.DefaultErrorMessage,
				DefaultErrorLink:    cfg.Codec.DefaultErrorLink,
			},
			CustomUI: &CustomUISettingsResponse{
				Enabled: cfg.CustomUI.Enabled,
			},
			Version:                       version.UIVersion,
			DisableWriteActions:           cfg.DisableWriteActions,
			WorkflowTerminateDisabled:     cfg.WorkflowTerminateDisabled,
			WorkflowCancelDisabled:        cfg.WorkflowCancelDisabled,
			WorkflowSignalDisabled:        cfg.WorkflowSignalDisabled,
			WorkflowUpdateDisabled:        cfg.WorkflowUpdateDisabled,
			WorkflowResetDisabled:         cfg.WorkflowResetDisabled,
			WorkflowPauseDisabled:         cfg.WorkflowPauseDisabled,
			BatchActionsDisabled:          cfg.BatchActionsDisabled,
			StartWorkflowDisabled:         cfg.StartWorkflowDisabled,
			HideWorkflowQueryErrors:       cfg.HideWorkflowQueryErrors,
			RefreshWorkflowCountsDisabled: cfg.RefreshWorkflowCountsDisabled,
			ActivityCommandsDisabled:      cfg.ActivityCommandsDisabled,
		}

		return c.JSON(http.StatusOK, settings)
	}
}

func errorHandler(
	ctx context.Context,
	mux *runtime.ServeMux,
	marshaler runtime.Marshaler,
	w http.ResponseWriter,
	r *http.Request,
	err error,
) {
	// Convert the error using serviceerror. The result does not conform to Google
	// gRPC status directly (it conforms to gogo gRPC status), but Err() does
	// based on internal code reading. However, Err() uses Google proto Any
	// which our marshaler is not expecting. So instead we are embedding similar
	// logic to runtime.DefaultHTTPProtoErrorHandler in here but with gogo
	// support. We don't implement custom content type marshaler or trailers at
	// this time.
	s := serviceerror.ToStatus(err)
	w.Header().Set("Content-Type", marshaler.ContentType(struct{}{}))

	buf, merr := marshaler.Marshal(s.Proto())
	if merr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"code": 13, "message": "failed to marshal error message"}`))
		return
	}

	w.WriteHeader(runtime.HTTPStatusFromCode(s.Code()))
	_, _ = w.Write(buf)
}

func getTemporalClientMux(c echo.Context, temporalConn *grpc.ClientConn, apiMiddleware []Middleware) (*runtime.ServeMux, error) {
	var muxOpts []runtime.ServeMuxOption
	for _, m := range apiMiddleware {
		muxOpts = append(muxOpts, m(c))
	}

	tMux := runtime.NewServeMux(
		append(muxOpts,
			withMarshaler(),
			version.WithVersionHeader(c),
			runtime.WithUnescapingMode(runtime.UnescapingModeAllExceptReserved),
			// This is necessary to get error details properly
			// marshalled in unary requests.
			runtime.WithErrorHandler(errorHandler),
		)...,
	)

	if wfErr := workflowservice.RegisterWorkflowServiceHandler(context.Background(), tMux, temporalConn); wfErr != nil {
		return nil, wfErr
	}

	if opErr := operatorservice.RegisterOperatorServiceHandler(context.Background(), tMux, temporalConn); opErr != nil {
		return nil, opErr
	}
	return tMux, nil
}

func withMarshaler() runtime.ServeMuxOption {
	return runtime.WithMarshalerOption(runtime.MIMEWildcard, temporalProtoMarshaler{
		contentType: "application/json",
		mOpts: temporalproto.CustomJSONMarshalOptions{
			Indent: "  ",
		},
	})
}
