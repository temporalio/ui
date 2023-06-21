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

package config

import (
	"errors"
	"time"
)

type (
	// Config contains the configuration for the UI server
	Config struct {
		TemporalGRPCAddress string `yaml:"temporalGrpcAddress"`
		Host                string `yaml:"host"`
		Port                int    `yaml:"port"`
		PublicPath          string `yaml:"publicPath"`
		TLS                 TLS    `yaml:"tls"`
		Auth                Auth   `yaml:"auth"`
		EnableUI            bool   `yaml:"enableUi"`
		CloudUI             bool   `yaml:"cloudUi"`
		UIAssetPath         string `yaml:"uiAssetPath"`
		EnableOpenAPI       bool   `yaml:"enableOpenApi"`
		CORS                CORS   `yaml:"cors"`
		DefaultNamespace    string `yaml:"defaultNamespace"`
		FeedbackURL         string `yaml:"feedbackUrl"`
		NotifyOnNewVersion  bool   `yaml:"notifyOnNewVersion"`
		// Show temporal-system namespace in namespace selector
		ShowTemporalSystemNamespace bool `yaml:"showTemporalSystemNamespace"`
		// How often to reload the config
		RefreshInterval     time.Duration `yaml:"refreshInterval"`
		Codec               Codec         `yaml:"codec"`
		DisableWriteActions bool          `yaml:"disableWriteActions"`
		// Discrete configuration for Workflow Actions in the UI
		WorkflowTerminateDisabled bool `yaml:"workflowTerminateDisabled"`
		WorkflowCancelDisabled    bool `yaml:"workflowCancelDisabled"`
		WorkflowSignalDisabled    bool `yaml:"workflowSignalDisabled"`
		WorkflowResetDisabled     bool `yaml:"workflowResetDisabled"`
		// Whether bulk/batch actions are enabled in the UI
		BatchActionsDisabled bool `yaml:"batchActionsDisabled"`
		// Whether to hide server errors for workflow queries in UI
		HideWorkflowQueryErrors bool `yaml:"hideWorkflowQueryErrors"`
		// Forward specified HTTP headers from HTTP API requests to Temporal gRPC backend
		ForwardHeaders []string `yaml:"forwardHeaders"`
	}

	CORS struct {
		AllowOrigins []string `yaml:"allowOrigins"`
		// CookieInsecure allows CSRF cookie to be sent to servers that the browser considers
		// unsecured. Useful for cases where the connection is secured via VPN rather than
		// HTTPS directly.
		CookieInsecure bool `yaml:"cookieInsecure"`
	}

	TLS struct {
		CaFile                 string `yaml:"caFile"`
		CertFile               string `yaml:"certFile"`
		KeyFile                string `yaml:"keyFile"`
		CaData                 string `yaml:"caData"`
		CertData               string `yaml:"certData"`
		KeyData                string `yaml:"keyData"`
		EnableHostVerification bool   `yaml:"enableHostVerification"`
		ServerName             string `yaml:"serverName"`
	}

	Auth struct {
		// Enabled - UI checks this first before reading your provider config
		Enabled bool `yaml:"enabled"`
		// A list of auth providers. Currently enables only the first provider in the list.
		Providers []AuthProvider `yaml:"providers"`
	}

	AuthProvider struct {
		// Label - optional label for the provider
		Label string `yaml:"label"`
		// Type of the auth provider. Only OIDC is supported today
		Type string `yaml:"type"`
		// OIDC .well-known/openid-configuration URL, ex. https://accounts.google.com/
		ProviderURL string `yaml:"providerUrl"`
		// IssuerUrl - optional. Needed only when differs from the auth provider URL
		IssuerUrl    string `yaml:"issuerUrl"`
		ClientID     string `yaml:"clientId"`
		ClientSecret string `yaml:"clientSecret"`
		// Scopes for auth. Typically [openid, profile, email]
		Scopes []string `yaml:"scopes"`
		// CallbackURL - URL for the callback URL, ex. https://localhost:8080/sso/callback
		CallbackURL string `yaml:"callbackUrl"`
		// Options added as URL query params when redirecting to auth provider. Can be used to configure custom auth flows such as Auth0 invitation flow.
		Options map[string]interface{} `yaml:"options"`
	}

	Codec struct {
		Endpoint                   string `yaml:"endpoint"`
		PassAccessToken            bool   `yaml:"passAccessToken"`
		IncludeCredentials         bool   `yaml:"includeCredentials"`
		DecodeEventHistoryDownload bool   `yaml:"decodeEventHistoryDownload"`
	}

	Filesystem struct {
		Path string `yaml:"path"`
	}
)

// Validate validates this config
func (c *Config) Validate() error {
	if c.TemporalGRPCAddress == "" {
		return errors.New("temporal frontend gRPC address is not set")
	}

	if err := c.Auth.Validate(); err != nil {
		return err
	}

	return nil
}

// Ensure that *Config implements ConfigProvider interface.
var _ ConfigProvider = &Config{}

// GetConfig implements ConfigProvider.
func (c *Config) GetConfig() (*Config, error) {
	return c, nil
}
