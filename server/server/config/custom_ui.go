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
	"net"
	"net/url"
	"regexp"
	"sort"
	"strings"
)

const (
	iframeExtensionMinimumWidth       = 32
	iframeExtensionMaxPermissions     = 4
	iframeExtensionMaxRoutePatterns   = 16
	iframeExtensionMaxRoutePatternLen = 512
)

var (
	iframeExtensionIDPattern           = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`)
	iframeRouteLiteralSegmentPattern   = regexp.MustCompile(`^[A-Za-z0-9._~-]+$`)
	iframeRouteParameterSegmentPattern = regexp.MustCompile(`^:[A-Za-z_][A-Za-z0-9_]*$`)
)

type iframeExtensionSlotPolicy struct {
	minHeight     int
	defaultHeight int
	defaultWidth  int
	maxHeight     int
	maxWidth      int
	maxExtensions int
}

// These policies are part of the iframe-extension contract. The client mirrors
// the defaults and clamps, while validation here prevents an operator from
// configuring an extension that can exceed the space owned by its host slot.
var iframeExtensionSlotPolicies = map[string]iframeExtensionSlotPolicy{
	"app.top-nav.actions.before": {
		minHeight:     24,
		defaultHeight: 32,
		defaultWidth:  160,
		maxHeight:     40,
		maxWidth:      320,
		maxExtensions: 2,
	},
	"app.top-nav.actions.after": {
		minHeight:     24,
		defaultHeight: 32,
		defaultWidth:  160,
		maxHeight:     40,
		maxWidth:      320,
		maxExtensions: 2,
	},
	"app.top-nav.sub-nav": {
		minHeight:     32,
		defaultHeight: 48,
		maxHeight:     240,
		maxWidth:      1200,
		maxExtensions: 2,
	},
	"workflow.header.after-details": {
		minHeight:     32,
		defaultHeight: 160,
		maxHeight:     640,
		maxWidth:      1200,
		maxExtensions: 4,
	},
}

var iframeExtensionPermissions = map[string]struct{}{
	"context:route":     {},
	"context:namespace": {},
	"context:workflow":  {},
	"navigation:write":  {},
}

// Validate validates custom UI definitions. An extension with any permission
// is privileged and must use an explicit, dedicated HTTPS origin so the host
// can address postMessage traffic to a non-opaque origin. "self" is never
// accepted when authentication is enabled because extension code would then be
// directly reachable on the origin that stores the UI session.
func (c CustomUI) Validate(authEnabled bool) error {
	if !c.Enabled {
		return nil
	}

	ids := make(map[string]struct{}, len(c.IframeExtensions))
	slotCounts := make(map[string]int, len(iframeExtensionSlotPolicies))

	for i, extension := range c.IframeExtensions {
		prefix := fmt.Sprintf("customUi.iframeExtensions[%d]", i)
		id := strings.TrimSpace(extension.ID)
		if id == "" {
			return fmt.Errorf("%s.id is required", prefix)
		}
		if !iframeExtensionIDPattern.MatchString(extension.ID) {
			return fmt.Errorf("%s.id must match %s", prefix, iframeExtensionIDPattern)
		}
		if _, duplicate := ids[extension.ID]; duplicate {
			return fmt.Errorf("%s.id %q is duplicated", prefix, extension.ID)
		}
		ids[extension.ID] = struct{}{}

		policy, knownSlot := iframeExtensionSlotPolicies[extension.Slot]
		if !knownSlot {
			return fmt.Errorf("%s.slot %q is not supported", prefix, extension.Slot)
		}
		slotCounts[extension.Slot]++
		if slotCounts[extension.Slot] > policy.maxExtensions {
			return fmt.Errorf(
				"%s.slot %q allows at most %d extensions",
				prefix,
				extension.Slot,
				policy.maxExtensions,
			)
		}

		if len(extension.Permissions) > iframeExtensionMaxPermissions {
			return fmt.Errorf("%s.permissions allows at most %d entries", prefix, iframeExtensionMaxPermissions)
		}
		permissions := make(map[string]struct{}, len(extension.Permissions))
		for _, permission := range extension.Permissions {
			if _, known := iframeExtensionPermissions[permission]; !known {
				return fmt.Errorf("%s.permissions contains unsupported permission %q", prefix, permission)
			}
			if _, duplicate := permissions[permission]; duplicate {
				return fmt.Errorf("%s.permissions contains duplicate permission %q", prefix, permission)
			}
			permissions[permission] = struct{}{}
		}
		if err := validateIframeExtensionRoutePatterns(extension.RoutePatterns); err != nil {
			return fmt.Errorf("%s.routePatterns: %w", prefix, err)
		}

		if err := validateIframeExtensionLocation(extension, authEnabled, len(permissions) > 0); err != nil {
			return fmt.Errorf("%s: %w", prefix, err)
		}
		if err := validateIframeExtensionSizing(extension.Sizing, policy); err != nil {
			return fmt.Errorf("%s.sizing: %w", prefix, err)
		}
	}

	return nil
}

func validateIframeExtensionRoutePatterns(patterns []string) error {
	if len(patterns) > iframeExtensionMaxRoutePatterns {
		return fmt.Errorf("allows at most %d entries", iframeExtensionMaxRoutePatterns)
	}

	for i, pattern := range patterns {
		if pattern == "" || len(pattern) > iframeExtensionMaxRoutePatternLen {
			return fmt.Errorf("entry %d must contain between 1 and %d bytes", i, iframeExtensionMaxRoutePatternLen)
		}
		if !strings.HasPrefix(pattern, "/") || strings.Contains(pattern, "\\") {
			return fmt.Errorf("entry %d must be a root-relative path pattern", i)
		}
		if pattern == "/" {
			continue
		}

		parameters := make(map[string]struct{})
		segments := strings.Split(strings.TrimPrefix(pattern, "/"), "/")
		for segmentIndex, segment := range segments {
			if segment == "*" {
				if segmentIndex != len(segments)-1 {
					return fmt.Errorf("entry %d may use * only as the final segment", i)
				}
				continue
			}
			if iframeRouteParameterSegmentPattern.MatchString(segment) {
				if _, duplicate := parameters[segment]; duplicate {
					return fmt.Errorf("entry %d contains duplicate parameter %q", i, segment)
				}
				parameters[segment] = struct{}{}
				continue
			}
			if !iframeRouteLiteralSegmentPattern.MatchString(segment) {
				return fmt.Errorf("entry %d contains unsupported segment %q", i, segment)
			}
		}
	}

	return nil
}

// IframeFrameSources returns the canonical origins that may be added to the
// index response's frame-src directive. Invalid configuration produces no
// partial allowlist.
func (c CustomUI) IframeFrameSources(authEnabled bool) ([]string, error) {
	if !c.Enabled {
		return []string{}, nil
	}
	if err := c.Validate(authEnabled); err != nil {
		return nil, err
	}

	origins := make(map[string]struct{}, len(c.IframeExtensions))
	for _, extension := range c.IframeExtensions {
		if strings.TrimSpace(extension.AllowedOrigin) == "self" {
			continue
		}
		origin, err := parseExtensionOrigin(extension.AllowedOrigin)
		if err != nil {
			// Validate above makes this unreachable; retain fail-closed behavior if
			// the validation implementation and extraction ever diverge.
			return nil, err
		}
		origins[canonicalOrigin(origin)] = struct{}{}
	}

	result := make([]string, 0, len(origins))
	for origin := range origins {
		result = append(result, origin)
	}
	sort.Strings(result)
	return result, nil
}

func validateIframeExtensionLocation(extension IframeExtension, authEnabled, privileged bool) error {
	allowedOrigin := strings.TrimSpace(extension.AllowedOrigin)
	if allowedOrigin == "self" {
		if authEnabled {
			return fmt.Errorf("allowedOrigin %q is not permitted when authentication is enabled", allowedOrigin)
		}
		if privileged {
			return fmt.Errorf("permissions require an explicit dedicated HTTPS allowedOrigin")
		}
		if err := validateRelativeExtensionSrc(extension.Src); err != nil {
			return err
		}
		return nil
	}

	originURL, err := parseExtensionOrigin(allowedOrigin)
	if err != nil {
		return fmt.Errorf("allowedOrigin: %w", err)
	}
	if !isAllowedExtensionScheme(originURL, privileged) {
		if privileged {
			return fmt.Errorf("permissions require an HTTPS allowedOrigin")
		}
		return fmt.Errorf("allowedOrigin must use HTTPS (HTTP is allowed only for local development)")
	}

	srcURL, err := parseAbsoluteExtensionSrc(extension.Src)
	if err != nil {
		return err
	}
	if !isAllowedExtensionScheme(srcURL, privileged) {
		if privileged {
			return fmt.Errorf("permissions require an absolute HTTPS src")
		}
		return fmt.Errorf("src must use HTTPS (HTTP is allowed only for local development)")
	}
	if canonicalOrigin(originURL) != canonicalOrigin(srcURL) {
		return fmt.Errorf("src origin must match allowedOrigin")
	}
	if privileged && !extension.Sandbox.AllowSameOrigin {
		return fmt.Errorf("permissions require sandbox.allowSameOrigin to be true")
	}

	return nil
}

func validateRelativeExtensionSrc(value string) error {
	src := strings.TrimSpace(value)
	if src == "" {
		return fmt.Errorf("src is required")
	}
	if strings.Contains(src, "\\") || !strings.HasPrefix(src, "/") || strings.HasPrefix(src, "//") {
		return fmt.Errorf("src must be a root-relative URL when allowedOrigin is self")
	}
	u, err := url.Parse(src)
	if err != nil || u.IsAbs() || u.Host != "" || u.Path == "" {
		return fmt.Errorf("src must be a valid root-relative URL when allowedOrigin is self")
	}
	return nil
}

func parseExtensionOrigin(value string) (*url.URL, error) {
	origin := strings.TrimSpace(value)
	if origin == "" || origin == "*" {
		return nil, fmt.Errorf("must be an explicit origin or self")
	}
	if strings.ContainsAny(origin, "?#") {
		return nil, fmt.Errorf("must not include credentials, a path, query, or fragment")
	}
	u, err := url.Parse(origin)
	if err != nil || !u.IsAbs() || u.Host == "" || u.Opaque != "" {
		return nil, fmt.Errorf("must be an absolute origin")
	}
	if u.User != nil || u.RawQuery != "" || u.Fragment != "" || (u.Path != "" && u.Path != "/") {
		return nil, fmt.Errorf("must not include credentials, a path, query, or fragment")
	}
	if u.Scheme != "https" && u.Scheme != "http" {
		return nil, fmt.Errorf("must use HTTP or HTTPS")
	}
	return u, nil
}

func parseAbsoluteExtensionSrc(value string) (*url.URL, error) {
	src := strings.TrimSpace(value)
	if src == "" {
		return nil, fmt.Errorf("src is required")
	}
	if strings.Contains(src, "\\") {
		return nil, fmt.Errorf("src must be a valid absolute URL")
	}
	u, err := url.Parse(src)
	if err != nil || !u.IsAbs() || u.Host == "" || u.Opaque != "" {
		return nil, fmt.Errorf("src must be an absolute URL for an explicit allowedOrigin")
	}
	if u.User != nil {
		return nil, fmt.Errorf("src must not include credentials")
	}
	if u.Scheme != "https" && u.Scheme != "http" {
		return nil, fmt.Errorf("src must use HTTP or HTTPS")
	}
	return u, nil
}

func isAllowedExtensionScheme(u *url.URL, privileged bool) bool {
	if u.Scheme == "https" {
		return true
	}
	return !privileged && u.Scheme == "http" && isLoopbackHostname(u.Hostname())
}

func isLoopbackHostname(hostname string) bool {
	if strings.EqualFold(hostname, "localhost") {
		return true
	}
	ip := net.ParseIP(hostname)
	return ip != nil && ip.IsLoopback()
}

func canonicalOrigin(u *url.URL) string {
	scheme := strings.ToLower(u.Scheme)
	hostname := strings.ToLower(u.Hostname())
	port := u.Port()
	if (scheme == "https" && port == "443") || (scheme == "http" && port == "80") {
		port = ""
	}

	host := hostname
	if strings.Contains(hostname, ":") {
		host = "[" + hostname + "]"
	}
	if port != "" {
		host = net.JoinHostPort(hostname, port)
	}
	return scheme + "://" + host
}

func validateIframeExtensionSizing(sizing IframeExtensionSizing, policy iframeExtensionSlotPolicy) error {
	values := map[string]int{
		"defaultHeight": sizing.DefaultHeight,
		"minHeight":     sizing.MinHeight,
		"maxHeight":     sizing.MaxHeight,
		"defaultWidth":  sizing.DefaultWidth,
		"minWidth":      sizing.MinWidth,
		"maxWidth":      sizing.MaxWidth,
	}
	for name, value := range values {
		if value < 0 {
			return fmt.Errorf("%s cannot be negative", name)
		}
	}

	minHeight := valueOrDefault(sizing.MinHeight, policy.minHeight)
	defaultHeight := valueOrDefault(sizing.DefaultHeight, policy.defaultHeight)
	maxHeight := valueOrDefault(sizing.MaxHeight, policy.maxHeight)
	if minHeight < policy.minHeight {
		return fmt.Errorf("minHeight cannot be less than slot minimum %d", policy.minHeight)
	}
	if minHeight > defaultHeight || defaultHeight > maxHeight {
		return fmt.Errorf("height must satisfy minHeight <= defaultHeight <= maxHeight")
	}
	if maxHeight > policy.maxHeight {
		return fmt.Errorf("maxHeight cannot exceed slot cap %d", policy.maxHeight)
	}

	if policy.defaultWidth != 0 || sizing.DefaultWidth != 0 || sizing.MinWidth != 0 || sizing.MaxWidth != 0 {
		minWidth := valueOrDefault(sizing.MinWidth, iframeExtensionMinimumWidth)
		defaultWidth := valueOrDefault(sizing.DefaultWidth, policy.defaultWidth)
		maxWidth := valueOrDefault(sizing.MaxWidth, policy.maxWidth)
		if minWidth < iframeExtensionMinimumWidth {
			return fmt.Errorf("minWidth cannot be less than %d", iframeExtensionMinimumWidth)
		}
		if minWidth > maxWidth {
			return fmt.Errorf("width must satisfy minWidth <= maxWidth")
		}
		if defaultWidth != 0 && (defaultWidth < minWidth || defaultWidth > maxWidth) {
			return fmt.Errorf("width must satisfy minWidth <= defaultWidth <= maxWidth")
		}
		if maxWidth > policy.maxWidth {
			return fmt.Errorf("maxWidth cannot exceed slot cap %d", policy.maxWidth)
		}
	}

	return nil
}

func valueOrDefault(value, defaultValue int) int {
	if value == 0 {
		return defaultValue
	}
	return value
}
