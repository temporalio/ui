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

package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
)

type User struct {
	OAuth2Token *oauth2.Token
	IDToken     *IDToken
}

type UserResponse struct {
	AccessToken string
	IDToken     string
	Name        string
	Email       string
	Picture     string
}

type IDToken struct {
	RawToken string
	Claims   *Claims
}

type Claims struct {
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

func ExchangeCode(ctx context.Context, r *http.Request, config *oauth2.Config, provider *oidc.Provider) (*User, error) {
	state, err := r.Cookie("state")
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "State cookie is not set in request")
	}
	if r.URL.Query().Get("state") != state.Value {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "State cookie did not match")
	}

	oauth2Token, err := config.Exchange(ctx, r.URL.Query().Get("code"))
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Unable to exchange token: "+err.Error())
	}

	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "No id_token field in oauth2 token.")
	}
	oidcConfig := &oidc.Config{
		ClientID: config.ClientID,
	}
	verifier := provider.Verifier(oidcConfig)
	idToken, err := verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Unable to verify ID Token: "+err.Error())
	}

	nonce, err := r.Cookie("nonce")
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "Nonce is not provided")
	}
	if idToken.Nonce != nonce.Value {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "Nonce did not match")
	}

	var claims Claims
	if err := idToken.Claims(&claims); err != nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	user := User{
		OAuth2Token: oauth2Token,
		IDToken: &IDToken{
			RawToken: rawIDToken,
			Claims:   &claims,
		},
	}

	return &user, nil
}

// ValidateAllowedClaims checks whether the raw ID token contains a claim
// matching the configured allowlist. It returns nil if no allowlist is
// configured or if the user has an allowed claim value. It returns an error
// if the user lacks the required claim.
//
// The claimKey supports dot notation for nested claims
// (e.g., "realm_access.roles" for Keycloak).
//
// Both string and array claim values are supported. For arrays, the user is
// authorized if ANY value in the claim matches ANY value in allowedValues.
func ValidateAllowedClaims(rawIDToken string, claimKey string, allowedValues []string) error {
	if claimKey == "" || len(allowedValues) == 0 {
		return nil
	}

	allClaims, err := decodeJWTPayload(rawIDToken)
	if err != nil {
		return fmt.Errorf("unable to decode token claims: %w", err)
	}

	claimValue, found := getNestedClaim(allClaims, claimKey)
	if !found {
		return fmt.Errorf("required claim %q not found in token", claimKey)
	}

	if matchesAllowedValues(claimValue, allowedValues) {
		return nil
	}

	return fmt.Errorf("user does not have any of the required values for claim %q", claimKey)
}

// decodeJWTPayload extracts and decodes the payload from a JWT.
// The token is assumed to be already verified.
func decodeJWTPayload(rawToken string) (map[string]interface{}, error) {
	parts := strings.SplitN(rawToken, ".", 3)
	if len(parts) < 2 {
		return nil, fmt.Errorf("malformed JWT: expected 3 parts, got %d", len(parts))
	}

	// JWT uses base64url encoding without padding
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("unable to decode JWT payload: %w", err)
	}

	var claims map[string]interface{}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("unable to parse JWT payload: %w", err)
	}

	return claims, nil
}

// getNestedClaim retrieves a claim value using dot notation.
// For example, "realm_access.roles" navigates into {"realm_access": {"roles": [...]}}.
// Keys containing colons (e.g., "cognito:groups") are treated as literal keys first.
func getNestedClaim(claims map[string]interface{}, key string) (interface{}, bool) {
	// First, try the key as a literal (handles keys like "cognito:groups")
	if val, ok := claims[key]; ok {
		return val, true
	}

	// Then try dot-notation traversal
	parts := strings.Split(key, ".")
	if len(parts) == 1 {
		return nil, false
	}

	var current interface{} = claims
	for _, part := range parts {
		m, ok := current.(map[string]interface{})
		if !ok {
			return nil, false
		}
		current, ok = m[part]
		if !ok {
			return nil, false
		}
	}

	return current, true
}

// matchesAllowedValues checks if a claim value (string or array) contains
// any of the allowed values.
func matchesAllowedValues(claimValue interface{}, allowedValues []string) bool {
	allowed := make(map[string]bool, len(allowedValues))
	for _, v := range allowedValues {
		allowed[v] = true
	}

	switch v := claimValue.(type) {
	case string:
		return allowed[v]
	case []interface{}:
		for _, item := range v {
			if s, ok := item.(string); ok && allowed[s] {
				return true
			}
		}
	}

	return false
}
