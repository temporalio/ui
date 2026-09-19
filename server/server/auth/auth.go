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
	sessionStartCookie        = "session_start"

	// defaultUserCookieDuration is how long the user* cookies live when no max
	// session duration is configured.
	defaultUserCookieDuration = time.Minute
	// defaultRefreshCookieDuration applies when the refresh token's lifetime can
	// neither be read from the token nor found in the provider config.
	defaultRefreshCookieDuration = 7 * 24 * time.Hour
	// maxRefreshCookieDuration bounds the refresh cookie, so a provider that
	// issues a very long lived token cannot pin one in the browser for years.
	maxRefreshCookieDuration = 30 * 24 * time.Hour
)

// CookieOptions carries the deployment settings that decide how the auth cookies
// are written.
type CookieOptions struct {
	// Secure marks the cookies Secure.
	Secure bool
	// SessionExpiresAt is when the current session reaches the configured
	// maxSessionDuration. The zero value means no max duration is configured.
	SessionExpiresAt time.Time
	// RefreshTokenDuration is the provider's configured refresh token lifetime.
	// Zero means unset.
	RefreshTokenDuration time.Duration
}

var tokenVerifier *oidc.IDTokenVerifier

func SetVerifier(v *oidc.IDTokenVerifier) {
	tokenVerifier = v
}

func stripBearerPrefix(token string) string {
	return strings.TrimPrefix(token, "Bearer ")
}

func SetUser(c echo.Context, user *User, opts CookieOptions) error {
	if user.OAuth2Token == nil {
		return errors.New("no OAuth2Token")
	}

	userR := UserResponse{
		AccessToken: user.OAuth2Token.AccessToken,
	}

	if user.IDToken != nil {
		userR.IDToken = user.IDToken.RawToken
		if user.IDToken.Claims != nil {
			userR.Name = user.IDToken.Claims.Name
			userR.Email = user.IDToken.Claims.Email
			userR.Picture = user.IDToken.Claims.Picture
		}
	}

	b, err := json.Marshal(userR)
	if err != nil {
		return errors.New("unable to serialize user data")
	}

	s := base64.StdEncoding.EncodeToString(b)
	parts := splitCookie(s)

	userMaxAge := userCookieMaxAge(opts.SessionExpiresAt, time.Now())

	for i, p := range parts {
		cookie := &http.Cookie{
			Name:     "user" + strconv.Itoa(i),
			Value:    p,
			MaxAge:   userMaxAge,
			Secure:   opts.Secure,
			HttpOnly: false,
			Path:     "/",
			SameSite: http.SameSiteStrictMode,
		}
		c.SetCookie(cookie)
	}

	if rt := user.OAuth2Token.RefreshToken; rt != "" {
		log.Println("[Auth] Setting refresh token cookie")

		refreshMaxAge := refreshCookieMaxAge(rt, opts.RefreshTokenDuration, time.Now())

		refreshCookie := &http.Cookie{
			Name:     "refresh",
			Value:    rt,
			MaxAge:   refreshMaxAge,
			Secure:   opts.Secure,
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

// userCookieMaxAge returns the MaxAge for the user* cookies.
//
// Those cookies carry the access token, so they must not outlive the session
// boundary. When maxSessionDuration is shorter than the cookie lifetime, or when
// the last refresh before the boundary issues a fresh full-length cookie, the
// browser keeps presenting a signed-in UI whose every API call returns 401.
// Clamping to the time left in the session closes that window.
func userCookieMaxAge(sessionExpiresAt time.Time, now time.Time) int {
	maxAge := defaultUserCookieDuration
	if !sessionExpiresAt.IsZero() {
		if remaining := sessionExpiresAt.Sub(now); remaining < maxAge {
			maxAge = remaining
		}
	}

	// A MaxAge of 0 means "session cookie" rather than "expire now", so floor at
	// one second for a session that is already over.
	if maxAge < time.Second {
		return 1
	}
	return int(maxAge.Seconds())
}

// refreshCookieMaxAge returns the MaxAge for the refresh cookie.
//
// It deliberately ignores oauth2.Token.Expiry. That field is populated from the
// token response's expires_in, which per RFC 6749 section 5.1 and OIDC Core
// section 3.2.2.5 describes the access token, not the refresh token. Deriving the
// refresh cookie from it expires the cookie at the same moment as the access
// token, so the refresh the cookie exists to perform fails with a 401.
//
// The lifetime is taken from, in order: the refresh token's own exp claim, the
// lifetime configured for the provider, then a 7 day default.
func refreshCookieMaxAge(refreshToken string, configured time.Duration, now time.Time) int {
	if exp, ok := jwtExp(refreshToken); ok {
		if remaining := exp.Sub(now); remaining > 0 {
			log.Printf("[Auth] Refresh cookie MaxAge from refresh token exp claim: %s", remaining.Round(time.Second))
			return cappedMaxAge(remaining)
		}
		log.Printf("[Auth] Refresh token exp claim is already past, falling back to configured lifetime")
	}

	if configured > 0 {
		log.Printf("[Auth] Refresh cookie MaxAge from configured refreshTokenDuration: %s", configured)
		return cappedMaxAge(configured)
	}

	log.Printf("[Auth] Refresh token is opaque and refreshTokenDuration is unset, using %s default", defaultRefreshCookieDuration)
	return cappedMaxAge(defaultRefreshCookieDuration)
}

// cappedMaxAge converts d to whole seconds, bounded by maxRefreshCookieDuration.
func cappedMaxAge(d time.Duration) int {
	if d > maxRefreshCookieDuration {
		log.Printf("[Auth] Refresh token lifetime %s exceeds the %s cap, capping", d.Round(time.Second), maxRefreshCookieDuration)
		d = maxRefreshCookieDuration
	}
	return int(d.Seconds())
}

// jwtExp reads the exp claim from a JWT without verifying its signature. It
// reports false for opaque tokens, malformed JWTs, and tokens carrying no exp.
//
// The signature is not checked because the claim is only used to choose a cookie
// lifetime. Nothing is trusted on the strength of it: the token itself is still
// validated by the identity provider on every refresh, and a forged exp can only
// make the browser drop a cookie sooner or later than it needed to.
func jwtExp(token string) (time.Time, bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return time.Time{}, false
	}

	// JWTs use unpadded base64url, but tolerate padding rather than give up on it.
	payload, err := base64.RawURLEncoding.DecodeString(strings.TrimRight(parts[1], "="))
	if err != nil {
		return time.Time{}, false
	}

	var claims struct {
		Exp json.Number `json:"exp"`
	}
	if err := json.Unmarshal(payload, &claims); err != nil || claims.Exp == "" {
		return time.Time{}, false
	}

	// exp is a NumericDate, which permits a fractional part.
	seconds, err := claims.Exp.Float64()
	if err != nil || seconds <= 0 {
		return time.Time{}, false
	}

	return time.Unix(int64(seconds), 0), true
}

// SessionExpiresAt reports when the session recorded by the session_start cookie
// reaches maxSessionDuration. It returns the zero time when no max duration is
// configured, or when the cookie is missing or unreadable.
func SessionExpiresAt(c echo.Context, maxSessionDuration time.Duration) time.Time {
	if maxSessionDuration <= 0 {
		return time.Time{}
	}

	cookie, err := c.Request().Cookie(sessionStartCookie)
	if err != nil {
		return time.Time{}
	}

	startTime, err := strconv.ParseInt(cookie.Value, 10, 64)
	if err != nil {
		return time.Time{}
	}

	return time.Unix(startTime, 0).Add(maxSessionDuration)
}

// SetSessionStart sets a cookie with the current timestamp to track when the session began.
// This should only be called on initial login, NOT on token refresh.
func SetSessionStart(c echo.Context, maxSessionDuration time.Duration, secure bool) {
	if maxSessionDuration <= 0 {
		return
	}

	cookie := &http.Cookie{
		Name:     sessionStartCookie,
		Value:    strconv.FormatInt(time.Now().Unix(), 10),
		MaxAge:   int(maxSessionDuration.Seconds()),
		Secure:   secure,
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
	}
	c.SetCookie(cookie)
}

// ValidateSessionDuration checks if the session has exceeded the configured max duration.
func ValidateSessionDuration(c echo.Context, maxSessionDuration time.Duration) error {
	if maxSessionDuration <= 0 {
		return nil
	}

	cookie, err := c.Request().Cookie(sessionStartCookie)
	if err != nil {
		return errors.New("session expired: missing session start")
	}

	startTime, err := strconv.ParseInt(cookie.Value, 10, 64)
	if err != nil {
		return errors.New("session expired: invalid session start")
	}

	sessionAge := time.Since(time.Unix(startTime, 0))
	if sessionAge > maxSessionDuration {
		return fmt.Errorf("session expired: exceeded max duration of %v", maxSessionDuration)
	}

	return nil
}

func validateJWT(ctx context.Context, tokenString string) error {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	if tokenString == "" {
		log.Println("[JWT Validation] Token is empty after stripping Bearer prefix")
		return errors.New("token is empty")
	}

	if tokenVerifier == nil {
		log.Println("[JWT Validation] CRITICAL: No verifier configured but validation was requested")
		return errors.New("authentication verifier not initialized")
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

	// Check if session has exceeded max duration (if configured)
	if err := ValidateSessionDuration(c, cfg.Auth.MaxSessionDuration); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	// Validate JWT tokens only when OIDC verifier is configured.
	// This preserves backward compatibility for deployments that use
	// non-OIDC auth (e.g., custom auth proxy, access token callback).
	idToken := c.Request().Header.Get(AuthorizationExtrasHeader)
	if tokenVerifier != nil {
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
