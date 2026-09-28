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
	"fmt"
	"net/url"
	"regexp"
	"time"
)

// escapedAPIKey matches the escape sequences that html/template writes.
var escapedAPIKey = regexp.MustCompile(`&(#\d+|amp|lt|gt|quot);`)

const (
	// DefaultTypeSafeModel is the TypeSafe System One model.
	DefaultTypeSafeModel = "jev-latest"
	// DefaultTypeSafeBaseURL is the public TypeSafe API.
	DefaultTypeSafeBaseURL = "https://api.typesafe.ai"
	// DefaultTypeSafeTimeout bounds one TypeSafe call, retries included.
	DefaultTypeSafeTimeout = 5 * time.Second
	// Defaults of the TypeSafe rate limit.
	DefaultTypeSafeRequestsPerMinute           = 30
	DefaultTypeSafeBurst                       = 10
	DefaultTypeSafeDeploymentRequestsPerMinute = 300
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
		CORS                CORS   `yaml:"cors"`
		DefaultNamespace    string `yaml:"defaultNamespace"`
		FeedbackURL         string `yaml:"feedbackUrl"`
		DisableNewsFetch    bool   `yaml:"disableNewsFetch"`
		// Show temporal-system namespace in namespace selector
		ShowTemporalSystemNamespace bool `yaml:"showTemporalSystemNamespace"`
		// Collapse the left navigation and saved views navigation by default
		NavCollapsedByDefault bool `yaml:"navCollapsedByDefault"`
		// How often to reload the config
		RefreshInterval     time.Duration `yaml:"refreshInterval"`
		Codec               Codec         `yaml:"codec"`
		DisableWriteActions bool          `yaml:"disableWriteActions"`
		// Discrete configuration for Workflow Actions in the UI
		WorkflowTerminateDisabled bool `yaml:"workflowTerminateDisabled"`
		WorkflowCancelDisabled    bool `yaml:"workflowCancelDisabled"`
		WorkflowSignalDisabled    bool `yaml:"workflowSignalDisabled"`
		WorkflowUpdateDisabled    bool `yaml:"workflowUpdateDisabled"`
		WorkflowResetDisabled     bool `yaml:"workflowResetDisabled"`
		WorkflowPauseDisabled     bool `yaml:"workflowPauseDisabled"`
		// Whether bulk/batch actions are enabled in the UI
		BatchActionsDisabled bool `yaml:"batchActionsDisabled"`
		// Whether start workflow is enabled in the UI
		StartWorkflowDisabled bool `yaml:"startWorkflowDisabled"`
		// Whether to hide server errors for workflow queries in UI
		HideWorkflowQueryErrors bool `yaml:"hideWorkflowQueryErrors"`
		// Whether to disable refreshing workflow counts in UI
		RefreshWorkflowCountsDisabled bool `yaml:"refreshWorkflowCountsDisabled"`
		// Whether to disable activity commands in the UI
		ActivityCommandsDisabled bool `yaml:"activityCommandsDisabled"`
		// Custom UI extensions that can mount iframe content into stable UI slots
		CustomUI CustomUI `yaml:"customUi"`
		// Forward specified HTTP headers from HTTP API requests to Temporal gRPC backend
		ForwardHeaders []string `yaml:"forwardHeaders"`
		HideLogs       bool     `yaml:"hideLogs"`
		// TLS configuration options to start UI Server in TLS mode
		UIServerTLS UIServerTLS `yaml:"uiServerTLS"`
		// TypeSafe holds the values that the features below share: one deployment has one TypeSafe API key
		TypeSafe TypeSafe `yaml:"typesafe"`
		// Natural-language workflow search
		NLSearch NLSearch `yaml:"nlSearch"`
		// Review of the workflow event history
		HistoryReview HistoryReview `yaml:"historyReview"`
	}

	// TypeSafe configures the client of the TypeSafe System One API. The features that
	// use it (nlSearch, historyReview) have their own gates.
	TypeSafe struct {
		// APIKey is the TypeSafe API key. It is a secret: the server never sends it to the browser.
		APIKey string `yaml:"apiKey"`
		// Model defaults to jev-latest
		Model string `yaml:"model"`
		// BaseURL defaults to https://api.typesafe.ai
		BaseURL string `yaml:"baseUrl"`
		// Timeout bounds one TypeSafe call, retries included. Defaults to 5s
		Timeout time.Duration `yaml:"timeout"`
		// RateLimit protects the quota of the API key
		RateLimit TypeSafeRateLimit `yaml:"rateLimit"`
	}

	// NLSearch is the gate of the natural-language workflow search. It translates text
	// into workflow filters. The feature is off by default.
	NLSearch struct {
		Enabled bool `yaml:"enabled"`
	}

	// HistoryReview is the gate of the event history review. It scores each row of a
	// workflow history for its importance to the outcome. The feature is off by default.
	HistoryReview struct {
		Enabled bool `yaml:"enabled"`
	}

	// TypeSafeRateLimit protects the quota of the TypeSafe API key of the deployment.
	// The limit is on unless Disabled is true: a zero value selects the default.
	TypeSafeRateLimit struct {
		// Disabled turns the rate limit off. It is the only way to turn it off
		Disabled bool `yaml:"disabled"`
		// RequestsPerMinute is the refill rate for each caller. A caller is the holder of one
		// Authorization header, or one remote IP when there is no Authorization header. Defaults to 30
		RequestsPerMinute int `yaml:"requestsPerMinute"`
		// Burst is the number of requests that a caller can make at one time. Defaults to 10
		Burst int `yaml:"burst"`
		// DeploymentRequestsPerMinute is the refill rate for all callers together. Defaults to 300
		DeploymentRequestsPerMinute int `yaml:"deploymentRequestsPerMinute"`
	}

	CORS struct {
		AllowOrigins          []string `yaml:"allowOrigins"`
		UnsafeAllowAllOrigins bool     `yaml:"unsafeAllowAllOrigins"`
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

	UIServerTLS struct {
		CertFile string `yaml:"certFile"`
		KeyFile  string `yaml:"keyFile"`
	}

	Auth struct {
		// Enabled - UI checks this first before reading your provider config
		Enabled bool `yaml:"enabled"`
		// RedirectToProvider - skip the UI login page and redirect unauthenticated users directly to the auth provider
		RedirectToProvider bool `yaml:"redirectToProvider"`
		// A list of auth providers. Currently enables only the first provider in the list.
		Providers []AuthProvider `yaml:"providers"`
		// MaxSessionDuration - optional maximum session duration. If set, users will be
		// forced to re-login after this duration regardless of token validity.
		// Example values: "8h", "24h", "168h" (1 week). If zero, no max duration is enforced.
		MaxSessionDuration time.Duration `yaml:"maxSessionDuration"`
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
		// UseIDTokenAsBearer - Use ID token instead of access token as Bearer in Authorization header
		UseIDTokenAsBearer bool `yaml:"useIdTokenAsBearer"`
	}

	Codec struct {
		Endpoint            string `yaml:"endpoint"`
		PassAccessToken     bool   `yaml:"passAccessToken"`
		IncludeCredentials  bool   `yaml:"includeCredentials"`
		DefaultErrorMessage string `yaml:"defaultErrorMessage"`
		DefaultErrorLink    string `yaml:"defaultErrorLink"`
	}

	CustomUI struct {
		Enabled          bool              `yaml:"enabled"`
		IframeExtensions []IframeExtension `yaml:"iframeExtensions"`
	}

	IframeExtension struct {
		ID            string                `yaml:"id"`
		Title         string                `yaml:"title"`
		Slot          string                `yaml:"slot"`
		Src           string                `yaml:"src"`
		AllowedOrigin string                `yaml:"allowedOrigin"`
		RoutePatterns []string              `yaml:"routePatterns"`
		Sandbox       IframeSandbox         `yaml:"sandbox"`
		Sizing        IframeExtensionSizing `yaml:"sizing"`
		Permissions   []string              `yaml:"permissions"`
	}

	IframeSandbox struct {
		AllowDownloads  bool `yaml:"allowDownloads"`
		AllowForms      bool `yaml:"allowForms"`
		AllowModals     bool `yaml:"allowModals"`
		AllowPopups     bool `yaml:"allowPopups"`
		AllowSameOrigin bool `yaml:"allowSameOrigin"`
	}

	IframeExtensionSizing struct {
		DefaultHeight int `yaml:"defaultHeight"`
		MinHeight     int `yaml:"minHeight"`
		MaxHeight     int `yaml:"maxHeight"`
		DefaultWidth  int `yaml:"defaultWidth"`
		MinWidth      int `yaml:"minWidth"`
		MaxWidth      int `yaml:"maxWidth"`
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
	if err := c.CustomUI.Validate(c.Auth.Enabled); err != nil {
		return err
	}

	if err := c.ValidateTypeSafe(); err != nil {
		return err
	}

	return nil
}

// NLSearchEnabled reports whether the natural-language search is on. It needs an API key to be on.
func (c *Config) NLSearchEnabled() bool {
	return c.NLSearch.Enabled && c.TypeSafe.APIKey != ""
}

// HistoryReviewEnabled reports whether the event history review is on. It needs an API key to be on.
func (c *Config) HistoryReviewEnabled() bool {
	return c.HistoryReview.Enabled && c.TypeSafe.APIKey != ""
}

// UsesTypeSafe reports whether a gate of a TypeSafe feature is on.
func (c *Config) UsesTypeSafe() bool {
	return c.NLSearch.Enabled || c.HistoryReview.Enabled
}

// ValidateTypeSafe validates the typesafe block. The key and the URL matter only
// when a feature uses them.
func (c *Config) ValidateTypeSafe() error {
	return c.TypeSafe.Validate(c.UsesTypeSafe())
}

// WithDefaults returns a copy with a default in place of each empty value.
func (t TypeSafe) WithDefaults() TypeSafe {
	if t.Model == "" {
		t.Model = DefaultTypeSafeModel
	}
	if t.BaseURL == "" {
		t.BaseURL = DefaultTypeSafeBaseURL
	}
	if t.Timeout <= 0 {
		t.Timeout = DefaultTypeSafeTimeout
	}
	t.RateLimit = t.RateLimit.WithDefaults()
	return t
}

// WithDefaults returns a copy with a default in place of each zero value. A config
// with no rateLimit block gets the default limit, not "no limit": only Disabled
// turns the limit off.
func (r TypeSafeRateLimit) WithDefaults() TypeSafeRateLimit {
	if r.RequestsPerMinute <= 0 {
		r.RequestsPerMinute = DefaultTypeSafeRequestsPerMinute
	}
	if r.Burst <= 0 {
		r.Burst = DefaultTypeSafeBurst
	}
	if r.DeploymentRequestsPerMinute <= 0 {
		r.DeploymentRequestsPerMinute = DefaultTypeSafeDeploymentRequestsPerMinute
	}
	return r
}

// Validate validates the typesafe block. inUse says that a feature gate is on.
func (t TypeSafe) Validate(inUse bool) error {
	if t.RateLimit.RequestsPerMinute < 0 {
		return errors.New("typesafe.rateLimit.requestsPerMinute must not be negative")
	}
	if t.RateLimit.Burst < 0 {
		return errors.New("typesafe.rateLimit.burst must not be negative")
	}
	if t.RateLimit.DeploymentRequestsPerMinute < 0 {
		return errors.New("typesafe.rateLimit.deploymentRequestsPerMinute must not be negative")
	}

	if !inUse {
		return nil
	}

	// The config templates escape HTML. A key such as "abc+def" arrives as "abc&#43;def",
	// and TypeSafe then rejects each request. Fail with a clear message.
	if escapedAPIKey.MatchString(t.APIKey) {
		return errors.New("typesafe.apiKey has an HTML escape sequence: the config template changed the key, set it in a config file as a quoted string")
	}

	if t.BaseURL == "" {
		return nil
	}

	u, err := url.Parse(t.BaseURL)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return fmt.Errorf("typesafe.baseUrl %q is not a valid http(s) URL", t.BaseURL)
	}

	return nil
}

// Ensure that *Config implements ConfigProvider interface.
var _ ConfigProvider = &Config{}

// GetConfig implements ConfigProvider.
func (c *Config) GetConfig() (*Config, error) {
	return c, nil
}
