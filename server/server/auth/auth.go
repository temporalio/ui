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
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/config"
)

const (
	AuthorizationExtrasHeader = "authorization-extras"
	cookieLen                 = 4000
)

var tokenVerifier *oidc.IDTokenVerifier

func SetVerifier(v *oidc.IDTokenVerifier) {
	tokenVerifier = v
}

func stripBearerPrefix(token string) string {
	return strings.TrimPrefix(token, "Bearer ")
}

func SetUser(c echo.Context, user *User) error {
	if user.OAuth2Token == nil {
		return errors.New("no OAuth2Token")
	}

	userR := UserResponse{
		AccessToken: user.OAuth2Token.AccessToken,
	}

	if user.IDToken != nil {
		userR.IDToken = user.IDToken.RawToken
	}

	if user.IDToken.Claims != nil {
		userR.Name = user.IDToken.Claims.Name
		userR.Email = user.IDToken.Claims.Email
		userR.Picture = user.IDToken.Claims.Picture
	}

	b, err := json.Marshal(userR)
	if err != nil {
		return errors.New("unable to serialize user data")
	}

	s := base64.StdEncoding.EncodeToString(b)
	parts := splitCookie(s)

	for i, p := range parts {
		cookie := &http.Cookie{
			Name:     "user" + strconv.Itoa(i),
			Value:    p,
			MaxAge:   int(time.Minute.Seconds()),
			Secure:   c.Request().TLS != nil,
			HttpOnly: false,
			Path:     "/",
			SameSite: http.SameSiteStrictMode,
		}
		c.SetCookie(cookie)
	}

	if rt := user.OAuth2Token.RefreshToken; rt != "" {
		log.Printf("[Auth] Setting refresh token cookie (length: %d)", len(rt))

		// Calculate MaxAge from OAuth2 token expiry
		var refreshMaxAge int
		if user.OAuth2Token.Expiry.IsZero() {
			// Fallback: if IdP doesn't provide expiry, use 7 days
			refreshMaxAge = int((7 * 24 * time.Hour).Seconds())
			log.Printf("[Auth] Warning: No refresh token expiry from IdP, using 7-day default")
		} else {
			// Use IdP's expiry, capped at 30 days for safety
			maxAge := time.Until(user.OAuth2Token.Expiry)
			if maxAge > 30*24*time.Hour {
				maxAge = 30 * 24 * time.Hour
				log.Printf("[Auth] Warning: IdP refresh token expiry > 30 days, capping at 30 days")
			}
			refreshMaxAge = int(maxAge.Seconds())
			log.Printf("[Auth] Setting refresh cookie MaxAge to %d seconds (%.1f days) from IdP",
				refreshMaxAge, maxAge.Hours()/24)
		}

		refreshCookie := &http.Cookie{
			Name:     "refresh",
			Value:    rt,
			MaxAge:   refreshMaxAge,
			Secure:   c.Request().TLS != nil,
			HttpOnly: true,
			Path:     "/",
			SameSite: http.SameSiteStrictMode,
		}
		c.SetCookie(refreshCookie)
	} else {
		log.Println("[Auth] No refresh token received from OAuth provider")
	}

	return nil
}

func validateJWT(ctx context.Context, tokenString string) error {
	if tokenString == "" {
		log.Println("[JWT Validation] Token is empty, skipping validation")
		return nil
	}

	if tokenVerifier == nil {
		log.Println("[JWT Validation] No verifier configured, skipping validation")
		return nil
	}

	_, err := tokenVerifier.Verify(ctx, tokenString)
	if err != nil {
		log.Printf("[JWT Validation] Token verification failed: %v", err)
		return errors.New("token invalid or expired")
	}

	log.Println("[JWT Validation] Token verified successfully")
	return nil
}

// ValidateAuthHeaderExists validates that the autorization header exists if auth is enabled.
// User autorization should be done in the frontend by claim-mapper and authorizer plugins.
// See https://docs.temporal.io/security#authentication
func ValidateAuthHeaderExists(c echo.Context, cfgProvider *config.ConfigProviderWithRefresh) error {
	cfg, err := cfgProvider.GetConfig()
	if err != nil {
		return err
	}

	isEnabled := cfg.Auth.Enabled
	if !isEnabled {
		return nil
	}

	token := c.Request().Header.Get(echo.HeaderAuthorization)
	if token == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	// The Authorization-Extras header contains the ID token (JWT) that we should validate
	// The Authorization header contains the access token (opaque string)
	idToken := c.Request().Header.Get(AuthorizationExtrasHeader)
	ctx := c.Request().Context()
	if idToken != "" {
		log.Println("[Auth] Validating ID token from Authorization-Extras header")
		if err := validateJWT(ctx, idToken); err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("invalid ID token: %v", err))
		}
	} else {
		log.Println("[Auth] No Authorization-Extras header, validating Authorization header")
		if err := validateJWT(ctx, stripBearerPrefix(token)); err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("invalid token: %v", err))
		}
	}

	// Handle token swapping for OIDC providers that require ID token as Bearer
	if len(cfg.Auth.Providers) > 0 && cfg.Auth.Providers[0].UseIDTokenAsBearer {
		if idToken != "" {
			// Replace the Authorization header with ID token
			c.Request().Header.Set(echo.HeaderAuthorization, "Bearer "+idToken)
			// Remove the Authorization-Extras header to avoid confusion
			c.Request().Header.Del(AuthorizationExtrasHeader)
		}
	}

	return nil
}

func splitCookie(val string) []string {
	splits := []string{}

	var l, r int
	for l, r = 0, cookieLen; r < len(val); l, r = r, r+cookieLen {
		for !utf8.RuneStart(val[r]) {
			r--
		}
		splits = append(splits, val[l:r])
	}
	splits = append(splits, val[l:])
	return splits
}
