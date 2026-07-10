// The MIT License
//
// Copyright (c) 2026 Temporal Technologies Inc.  All rights reserved.
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
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func validPrivilegedCustomUI() CustomUI {
	return CustomUI{
		Enabled: true,
		IframeExtensions: []IframeExtension{
			{
				ID:            "workflow.metrics-v1",
				Slot:          "workflow.header.after-details",
				Src:           "https://extensions.example.com/workflow/metrics?compact=true",
				AllowedOrigin: "https://extensions.example.com",
				RoutePatterns: []string{
					"/namespaces/:namespace/workflows/:workflow/:run/*",
				},
				Sandbox: IframeSandbox{AllowSameOrigin: true},
				Sizing: IframeExtensionSizing{
					DefaultHeight: 160,
					MinHeight:     96,
					MaxHeight:     480,
					DefaultWidth:  400,
					MinWidth:      320,
					MaxWidth:      800,
				},
				Permissions: []string{"context:route", "context:namespace", "context:workflow", "navigation:write"},
			},
		},
	}
}

func TestIframeExtensionSlotPolicies(t *testing.T) {
	expected := map[string]iframeExtensionSlotPolicy{
		"app.top-nav.actions.before": {
			minHeight: 24, defaultHeight: 32, defaultWidth: 160, maxHeight: 40, maxWidth: 320, maxExtensions: 2,
		},
		"app.top-nav.actions.after": {
			minHeight: 24, defaultHeight: 32, defaultWidth: 160, maxHeight: 40, maxWidth: 320, maxExtensions: 2,
		},
		"app.top-nav.sub-nav": {
			minHeight: 32, defaultHeight: 48, maxHeight: 240, maxWidth: 1200, maxExtensions: 2,
		},
		"workflow.header.after-details": {
			minHeight: 32, defaultHeight: 160, maxHeight: 640, maxWidth: 1200, maxExtensions: 4,
		},
	}

	assert.Equal(t, expected, iframeExtensionSlotPolicies)
}

func TestCustomUIValidateAcceptsSupportedTrustModes(t *testing.T) {
	tests := []struct {
		name        string
		authEnabled bool
		extension   IframeExtension
	}{
		{
			name: "unprivileged root-relative self extension without auth",
			extension: IframeExtension{
				ID: "local", Slot: "app.top-nav.actions.before", Src: "/extension.html", AllowedOrigin: "self",
			},
		},
		{
			name:        "unprivileged HTTPS extension with an opaque sandbox origin",
			authEnabled: true,
			extension: IframeExtension{
				ID: "remote", Slot: "app.top-nav.sub-nav", Src: "https://extensions.example.com/banner", AllowedOrigin: "https://extensions.example.com/",
			},
		},
		{
			name: "unprivileged loopback HTTP development extension",
			extension: IframeExtension{
				ID: "development", Slot: "app.top-nav.sub-nav", Src: "http://127.0.0.1:5173/banner", AllowedOrigin: "http://127.0.0.1:5173",
			},
		},
		{
			name:        "privileged dedicated HTTPS extension",
			authEnabled: true,
			extension:   validPrivilegedCustomUI().IframeExtensions[0],
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := (CustomUI{Enabled: true, IframeExtensions: []IframeExtension{test.extension}}).Validate(test.authEnabled)
			require.NoError(t, err)
		})
	}
}

func TestCustomUIValidateRejectsInvalidContracts(t *testing.T) {
	tests := []struct {
		name          string
		authEnabled   bool
		mutate        func(*CustomUI)
		errorContains string
	}{
		{
			name:          "empty ID",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].ID = "  " },
			errorContains: ".id is required",
		},
		{
			name:          "invalid ID",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].ID = "not valid" },
			errorContains: ".id must match",
		},
		{
			name:          "ID with surrounding whitespace",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].ID = " workflow.metrics " },
			errorContains: ".id must match",
		},
		{
			name:          "ID longer than 64 bytes",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].ID = "a" + strings.Repeat("b", 64) },
			errorContains: ".id must match",
		},
		{
			name: "duplicate ID",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions = append(customUI.IframeExtensions, customUI.IframeExtensions[0])
			},
			errorContains: "is duplicated",
		},
		{
			name:          "unknown slot",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].Slot = "unknown.slot" },
			errorContains: "is not supported",
		},
		{
			name:          "unknown permission",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].Permissions = []string{"context:user"} },
			errorContains: "unsupported permission",
		},
		{
			name: "too many permissions",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].Permissions = []string{"context:route", "context:namespace", "context:workflow", "navigation:write", "context:route"}
			},
			errorContains: "allows at most 4 entries",
		},
		{
			name: "duplicate permission",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].Permissions = []string{"context:route", "context:route"}
			},
			errorContains: "duplicate permission",
		},
		{
			name:        "self with authentication",
			authEnabled: true,
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "self"
				customUI.IframeExtensions[0].Src = "/extension.html"
				customUI.IframeExtensions[0].Permissions = nil
			},
			errorContains: "not permitted when authentication is enabled",
		},
		{
			name: "privileged self extension",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "self"
				customUI.IframeExtensions[0].Src = "/extension.html"
			},
			errorContains: "permissions require an explicit dedicated HTTPS allowedOrigin",
		},
		{
			name: "absolute src for self",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "self"
				customUI.IframeExtensions[0].Permissions = nil
			},
			errorContains: "root-relative URL",
		},
		{
			name:          "relative src for explicit origin",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].Src = "/extension.html" },
			errorContains: "absolute URL",
		},
		{
			name:          "origin mismatch",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].Src = "https://other.example.com/extension" },
			errorContains: "src origin must match",
		},
		{
			name: "origin with path",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "https://extensions.example.com/path"
			},
			errorContains: "must not include credentials, a path, query, or fragment",
		},
		{
			name: "non-local HTTP origin",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "http://extensions.example.com"
				customUI.IframeExtensions[0].Src = "http://extensions.example.com/extension"
				customUI.IframeExtensions[0].Permissions = nil
			},
			errorContains: "HTTP is allowed only for local development",
		},
		{
			name: "privileged local HTTP extension",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "http://localhost:5173"
				customUI.IframeExtensions[0].Src = "http://localhost:5173/extension"
			},
			errorContains: "permissions require an HTTPS allowedOrigin",
		},
		{
			name:          "privileged opaque sandbox origin",
			mutate:        func(customUI *CustomUI) { customUI.IframeExtensions[0].Sandbox.AllowSameOrigin = false },
			errorContains: "permissions require sandbox.allowSameOrigin",
		},
		{
			name: "src credentials",
			mutate: func(customUI *CustomUI) {
				customUI.IframeExtensions[0].AllowedOrigin = "https://extensions.example.com"
				customUI.IframeExtensions[0].Src = "https://user:password@extensions.example.com/extension"
			},
			errorContains: "src must not include credentials",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			customUI := validPrivilegedCustomUI()
			test.mutate(&customUI)
			err := customUI.Validate(test.authEnabled)
			require.Error(t, err)
			assert.ErrorContains(t, err, test.errorContains)
		})
	}
}

func TestCustomUIValidateRoutePatterns(t *testing.T) {
	validPatterns := []string{
		"/",
		"/namespaces/:namespace/workflows",
		"/namespaces/:namespace/workflows/:workflow/:run/*",
		"/fixed-segment/value.json",
	}
	customUI := validPrivilegedCustomUI()
	customUI.IframeExtensions[0].RoutePatterns = validPatterns
	require.NoError(t, customUI.Validate(false))

	tests := []struct {
		name     string
		patterns []string
	}{
		{name: "too many", patterns: make([]string, iframeExtensionMaxRoutePatterns+1)},
		{name: "too long", patterns: []string{"/" + strings.Repeat("a", iframeExtensionMaxRoutePatternLen)}},
		{name: "empty", patterns: []string{""}},
		{name: "not root relative", patterns: []string{"namespaces/:namespace"}},
		{name: "backslash", patterns: []string{`/namespaces\:namespace`}},
		{name: "parentheses", patterns: []string{`/namespaces/(.*)`}},
		{name: "wildcard not terminal", patterns: []string{`/namespaces/*/workflows`}},
		{name: "embedded wildcard", patterns: []string{`/namespaces/work*`}},
		{name: "malformed parameter", patterns: []string{`/namespaces/:bad-param`}},
		{name: "duplicate parameter", patterns: []string{`/:namespace/:namespace`}},
		{name: "empty segment", patterns: []string{`/namespaces//workflows`}},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			customUI := validPrivilegedCustomUI()
			customUI.IframeExtensions[0].RoutePatterns = test.patterns
			require.Error(t, customUI.Validate(false))
		})
	}
}

func TestCustomUIValidateSizingAndSlotCounts(t *testing.T) {
	for slot := range iframeExtensionSlotPolicies {
		t.Run(slot+" defaults", func(t *testing.T) {
			customUI := CustomUI{Enabled: true, IframeExtensions: []IframeExtension{
				{ID: "defaults", Slot: slot, Src: "/extension", AllowedOrigin: "self"},
			}}
			require.NoError(t, customUI.Validate(false))
		})
	}

	tests := []struct {
		name          string
		slot          string
		sizing        IframeExtensionSizing
		errorContains string
	}{
		{name: "negative", slot: "app.top-nav.sub-nav", sizing: IframeExtensionSizing{DefaultHeight: -1}, errorContains: "cannot be negative"},
		{name: "top nav below minimum height", slot: "app.top-nav.actions.before", sizing: IframeExtensionSizing{MinHeight: 23}, errorContains: "slot minimum 24"},
		{name: "block below minimum height", slot: "app.top-nav.sub-nav", sizing: IframeExtensionSizing{MinHeight: 31}, errorContains: "slot minimum 32"},
		{name: "height ordering", slot: "app.top-nav.sub-nav", sizing: IframeExtensionSizing{MinHeight: 100, DefaultHeight: 80}, errorContains: "minHeight <= defaultHeight <= maxHeight"},
		{name: "top nav height cap", slot: "app.top-nav.actions.after", sizing: IframeExtensionSizing{MaxHeight: 41}, errorContains: "slot cap 40"},
		{name: "sub nav height cap", slot: "app.top-nav.sub-nav", sizing: IframeExtensionSizing{MaxHeight: 241}, errorContains: "slot cap 240"},
		{name: "workflow height cap", slot: "workflow.header.after-details", sizing: IframeExtensionSizing{MaxHeight: 641}, errorContains: "slot cap 640"},
		{name: "width below minimum", slot: "app.top-nav.sub-nav", sizing: IframeExtensionSizing{MinWidth: 31}, errorContains: "minWidth cannot be less than 32"},
		{name: "top nav effective width ordering", slot: "app.top-nav.actions.before", sizing: IframeExtensionSizing{MinWidth: 200}, errorContains: "minWidth <= defaultWidth <= maxWidth"},
		{name: "width ordering", slot: "app.top-nav.sub-nav", sizing: IframeExtensionSizing{DefaultWidth: 200, MinWidth: 300}, errorContains: "minWidth <= defaultWidth <= maxWidth"},
		{name: "top nav width cap", slot: "app.top-nav.actions.before", sizing: IframeExtensionSizing{MaxWidth: 321}, errorContains: "slot cap 320"},
		{name: "block width cap", slot: "workflow.header.after-details", sizing: IframeExtensionSizing{MaxWidth: 1201}, errorContains: "slot cap 1200"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			customUI := CustomUI{Enabled: true, IframeExtensions: []IframeExtension{
				{ID: "sizing", Slot: test.slot, Src: "/extension", AllowedOrigin: "self", Sizing: test.sizing},
			}}
			err := customUI.Validate(false)
			require.Error(t, err)
			assert.ErrorContains(t, err, test.errorContains)
		})
	}

	for slot, policy := range iframeExtensionSlotPolicies {
		t.Run(slot+" count cap", func(t *testing.T) {
			customUI := CustomUI{Enabled: true}
			for i := 0; i <= policy.maxExtensions; i++ {
				customUI.IframeExtensions = append(customUI.IframeExtensions, IframeExtension{
					ID: fmt.Sprintf("extension-%d", i), Slot: slot, Src: "/extension", AllowedOrigin: "self",
				})
			}
			err := customUI.Validate(false)
			require.Error(t, err)
			assert.ErrorContains(t, err, fmt.Sprintf("allows at most %d extensions", policy.maxExtensions))
		})
	}
}

func TestCustomUIIframeFrameSources(t *testing.T) {
	customUI := CustomUI{
		Enabled: true,
		IframeExtensions: []IframeExtension{
			{ID: "self", Slot: "app.top-nav.sub-nav", Src: "/extension", AllowedOrigin: "self"},
			{ID: "remote-b", Slot: "app.top-nav.sub-nav", Src: "https://b.example.com/extension", AllowedOrigin: "https://b.example.com/"},
			{ID: "remote-a", Slot: "workflow.header.after-details", Src: "https://a.example.com/extension", AllowedOrigin: "https://A.EXAMPLE.com:443"},
		},
	}

	sources, err := customUI.IframeFrameSources(false)
	require.NoError(t, err)
	assert.Equal(t, []string{"https://a.example.com", "https://b.example.com"}, sources)

	customUI.Enabled = false
	sources, err = customUI.IframeFrameSources(false)
	require.NoError(t, err)
	assert.Empty(t, sources)

	customUI.Enabled = true
	customUI.IframeExtensions[0].Slot = "invalid"
	_, err = customUI.IframeFrameSources(false)
	require.Error(t, err)
}

func TestCustomUIDisabledSkipsDefinitions(t *testing.T) {
	customUI := CustomUI{
		Enabled: false,
		IframeExtensions: []IframeExtension{
			{ID: "invalid", Slot: "unknown", Src: "javascript:alert(1)", AllowedOrigin: "*"},
		},
	}

	require.NoError(t, customUI.Validate(true))
	sources, err := customUI.IframeFrameSources(true)
	require.NoError(t, err)
	assert.Empty(t, sources)
}

func TestConfigValidateIncludesCustomUI(t *testing.T) {
	cfg := Config{
		TemporalGRPCAddress: "localhost:7233",
		CustomUI: CustomUI{Enabled: true, IframeExtensions: []IframeExtension{
			{ID: "extension", Slot: "unknown", Src: "/extension", AllowedOrigin: "self"},
		}},
	}

	err := cfg.Validate()
	require.Error(t, err)
	assert.ErrorContains(t, err, "customUi.iframeExtensions[0].slot")
}
