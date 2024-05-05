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
	Enabled          bool
	Flow             string
	ProviderURL      string
	IssuerURL        string
	AuthorizationURL string
	ClientID         string
	Scopes           []string
	Options          []string
}

type CodecResponse struct {
	Endpoint           string
	PassAccessToken    bool
	IncludeCredentials bool
}

type SettingsResponse struct {
	Auth                        *Auth
	BannerText                  string
	DefaultNamespace            string
	ShowTemporalSystemNamespace bool
	FeedbackURL                 string
	NotifyOnNewVersion          bool
	Codec                       *CodecResponse
	Version                     string
	DisableWriteActions         bool
	WorkflowTerminateDisabled   bool
	WorkflowCancelDisabled      bool
	WorkflowSignalDisabled      bool
	WorkflowResetDisabled       bool
	BatchActionsDisabled        bool
	HideWorkflowQueryErrors     bool
}

func TemporalAPIHandler(cfgProvider *config.ConfigProviderWithRefresh, apiMiddleware []Middleware) echo.HandlerFunc {
	return func(c echo.Context) error {
		err := auth.ValidateAuthHeaderExists(c, cfgProvider)
		if err != nil {
			return err
		}

		cfg, err := cfgProvider.GetConfig()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}

		tls, err := rpc.CreateTLSConfig(cfg.TemporalGRPCAddress, &cfg.TLS)
		if err != nil {
			fmt.Printf("unable to read TLS configs: %s", err)
		}
		conn := rpc.CreateGRPCConnection(cfg.TemporalGRPCAddress, tls)
		defer conn.Close()

		mux, err := getTemporalClientMux(c, conn, apiMiddleware)
		if err != nil {
			return err
		}

		mux.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func GetSettings(cfgProvider *config.ConfigProviderWithRefresh) func(echo.Context) error {
	return func(c echo.Context) error {
		cfg, err := cfgProvider.GetConfig()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}

		var options []string
		var authProviderCfg config.AuthProvider
		if len(cfg.Auth.Providers) != 0 {
			authProviderCfg = cfg.Auth.Providers[0]
			for k := range authProviderCfg.Options {
				options = append(options, k)
			}
		}

		settings := &SettingsResponse{
			Auth: &Auth{
				Enabled:          cfg.Auth.Enabled,
				Flow:             authProviderCfg.Flow,
				ProviderURL:      authProviderCfg.ProviderURL,
				IssuerURL:        authProviderCfg.IssuerURL,
				AuthorizationURL: authProviderCfg.AuthorizationURL,
				ClientID:         authProviderCfg.ClientID,
				Scopes:           authProviderCfg.Scopes,
				Options:          options,
			},
			BannerText:                  cfg.BannerText,
			DefaultNamespace:            cfg.DefaultNamespace,
			ShowTemporalSystemNamespace: cfg.ShowTemporalSystemNamespace,
			FeedbackURL:                 cfg.FeedbackURL,
			NotifyOnNewVersion:          cfg.NotifyOnNewVersion,
			Codec: &CodecResponse{
				Endpoint:           cfg.Codec.Endpoint,
				PassAccessToken:    cfg.Codec.PassAccessToken,
				IncludeCredentials: cfg.Codec.IncludeCredentials,
			},
			Version:                   version.UIVersion,
			DisableWriteActions:       cfg.DisableWriteActions,
			WorkflowTerminateDisabled: cfg.WorkflowTerminateDisabled,
			WorkflowCancelDisabled:    cfg.WorkflowCancelDisabled,
			WorkflowSignalDisabled:    cfg.WorkflowSignalDisabled,
			WorkflowResetDisabled:     cfg.WorkflowResetDisabled,
			BatchActionsDisabled:      cfg.BatchActionsDisabled,
			HideWorkflowQueryErrors:   cfg.HideWorkflowQueryErrors,
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
		contentType: runtime.MIMEWildcard,
		mOpts: temporalproto.CustomJSONMarshalOptions{
			Indent: "  ",
		},
	})
}
