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

package route

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gorilla/securecookie"
	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/auth"
	"github.com/temporalio/ui-server/v2/server/config"
	"golang.org/x/net/context"
	"golang.org/x/oauth2"
)

// validateReturnURL checks that the returnURL is either a relative path, same-host,
// or belongs to one of the configured CORS allowed origins.
func validateReturnURL(returnURL string, allowedOrigins []string, requestHost string) error {
	if returnURL == "" {
		return nil
	}

	u, err := url.Parse(returnURL)
	if err != nil {
		return fmt.Errorf("invalid returnUrl: %w", err)
	}

	// Allow relative URLs (no host) or same-host redirects
	if u.Host == "" || u.Host == requestHost {
		return nil
	}

	// Allow redirects to configured CORS origins
	returnOrigin := fmt.Sprintf("%s://%s", u.Scheme, u.Host)
	for _, origin := range allowedOrigins {
		if returnOrigin == origin {
			return nil
		}
	}

	return fmt.Errorf("returnUrl host %s not in allowed origins", u.Host)
}

// SetAuthRoutes sets routes used by auth
func SetAuthRoutes(e *echo.Echo, cfgProvider *config.ConfigProviderWithRefresh) {
	ctx := context.Background()
	serverCfg, err := cfgProvider.GetConfig()
	if err != nil {
		fmt.Printf("unable to get auth config: %s\n", err)
	}

	if !serverCfg.Auth.Enabled {
		return
	}

	if len(serverCfg.Auth.Providers) == 0 {
		log.Fatal(`auth providers configuration is empty. Configure an auth provider or disable auth`)
	}

	providerCfg := serverCfg.Auth.Providers[0] // only single provider is currently supported

	if len(providerCfg.IssuerUrl) > 0 {
		ctx = oidc.InsecureIssuerURLContext(ctx, providerCfg.IssuerUrl)
	}
	provider, err := oidc.NewProvider(ctx, providerCfg.ProviderURL)
	if err != nil {
		log.Fatal(err)
	}

	oidcConfig := &oidc.Config{ClientID: providerCfg.ClientID}
	verifier := provider.Verifier(oidcConfig)
	auth.SetVerifier(verifier)

	oauthCfg := oauth2.Config{
		ClientID:     providerCfg.ClientID,
		ClientSecret: providerCfg.ClientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  providerCfg.CallbackURL,
		Scopes:       providerCfg.Scopes,
	}

	secure, err := cookieSecureForCallbackURL(providerCfg.CallbackURL)
	if err != nil {
		log.Fatal(err)
	}

	api := e.Group("/auth")
	api.GET("/sso", authenticate(&oauthCfg, providerCfg.Options, serverCfg.CORS.AllowOrigins, secure))
	api.GET("/sso/callback", authenticateCb(ctx, &oauthCfg, provider, serverCfg.Auth.MaxSessionDuration, secure))
	api.GET("/sso_callback", authenticateCb(ctx, &oauthCfg, provider, serverCfg.Auth.MaxSessionDuration, secure)) // compatibility with UI v1
	api.GET("/refresh", refreshTokens(ctx, &oauthCfg, provider, serverCfg.Auth.MaxSessionDuration, secure))
	api.GET("/logout", logout(secure))
}

// cookieSecureForCallbackURL reports whether the auth cookies may carry the Secure
// attribute, based on the scheme of the OIDC callback URL. That URL is the
// browser-facing address the identity provider redirects back to, so it is the
// authoritative record of how a browser reaches this deployment.
//
// An unrecognized scheme is an error rather than a false return, so that a malformed
// callback URL fails loudly at startup.
func cookieSecureForCallbackURL(callbackURL string) (bool, error) {
	u, err := url.Parse(callbackURL)
	if err != nil {
		return false, fmt.Errorf("unable to parse auth callback url: %w", err)
	}

	switch u.Scheme {
	case "https":
		return true, nil
	case "http":
		return false, nil
	default:
		return false, fmt.Errorf("auth callback url must use http or https, got %q", callbackURL)
	}
}

func authenticate(config *oauth2.Config, options map[string]interface{}, allowedOrigins []string, secure bool) func(echo.Context) error {
	return func(c echo.Context) error {
		state, err := randString()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err)
		}
		nonce, err := randNonce(c, allowedOrigins)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		setCallbackCookie(c, "state", state, secure)
		setCallbackCookie(c, "nonce", nonce, secure)

		opts := []oauth2.AuthCodeOption{
			oidc.Nonce(nonce),
		}
		for k, v := range options {
			var value string
			if vStr, ok := v.(string); ok {
				value = vStr
			}

			// Some options, ex Auth0 invitation code, may be undefined in config as they are unknowns beforehand
			// These may come from outside, ex in an invitation email
			vOverride := c.QueryParam(k)
			if vOverride != "" {
				value = vOverride
			}

			opts = append(opts, oauth2.SetAuthURLParam(k, value))
		}

		url := config.AuthCodeURL(state, opts...)

		return c.Redirect(http.StatusFound, url)
	}
}

func authenticateCb(ctx context.Context, oauthCfg *oauth2.Config, provider *oidc.Provider, maxSessionDuration time.Duration, secure bool) func(echo.Context) error {
	return func(c echo.Context) error {
		user, err := auth.ExchangeCode(ctx, c.Request(), oauthCfg, provider)
		if err != nil {
			return err
		}

		err = auth.SetUser(c, user, secure)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "unable to set user: "+err.Error())
		}

		// Set session start time for max session duration enforcement
		auth.SetSessionStart(c, maxSessionDuration, secure)

		nonceS, err := c.Request().Cookie("nonce")
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "nonce is not provided")
		}
		nonce, err := nonceFromString(nonceS.Value)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "nonce is invalid")
		}

		returnUrl := nonce.ReturnURL
		if returnUrl == "" {
			returnUrl = "/"
		}

		return c.Redirect(http.StatusSeeOther, returnUrl)
	}
}

// refreshTokens exchanges a refresh token (stored in an HttpOnly cookie) for a new access token
// and optionally a new ID token. It resets the cookies using auth.SetUser and returns 200.
func refreshTokens(ctx context.Context, oauthCfg *oauth2.Config, provider *oidc.Provider, maxSessionDuration time.Duration, secure bool) func(echo.Context) error {
	return func(c echo.Context) error {
		startTime := time.Now()
		clientIP := c.RealIP()

		log.Printf("token_refresh_attempt ip=%s", clientIP)

		if err := auth.ValidateSessionDuration(c, maxSessionDuration); err != nil {
			log.Printf("token_refresh_denied reason=session_expired ip=%s", clientIP)
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}

		// Read refresh cookie
		refreshCookie, err := c.Request().Cookie("refresh")
		if err != nil || refreshCookie.Value == "" {
			duration := time.Since(startTime).Milliseconds()
			log.Printf("token_refresh_failed reason=missing_refresh_token ip=%s duration_ms=%d", clientIP, duration)
			return echo.NewHTTPError(http.StatusUnauthorized, "missing refresh token")
		}

		// Use the refresh token to obtain a new token set
		ts := oauthCfg.TokenSource(ctx, &oauth2.Token{RefreshToken: refreshCookie.Value})
		newTok, err := ts.Token()
		if err != nil {
			duration := time.Since(startTime).Milliseconds()
			log.Printf("token_refresh_failed reason=token_exchange_failed ip=%s error=%q duration_ms=%d", clientIP, err.Error(), duration)
			return echo.NewHTTPError(http.StatusUnauthorized, "unable to refresh token")
		}

		log.Printf("token_exchange_success ip=%s expiry=%s", clientIP, newTok.Expiry.Format(time.RFC3339))

		var user auth.User
		user.OAuth2Token = newTok

		// Try to capture a new ID token if provided and verify it
		if raw, ok := newTok.Extra("id_token").(string); ok && raw != "" {
			oidcConfig := &oidc.Config{ClientID: oauthCfg.ClientID}
			verifier := provider.Verifier(oidcConfig)
			idTok, verr := verifier.Verify(ctx, raw)
			if verr == nil {
				var claims auth.Claims
				// If claims fail, we still proceed with tokens
				_ = idTok.Claims(&claims)
				user.IDToken = &auth.IDToken{RawToken: raw, Claims: &claims}
			} else {
				log.Printf("id_token_verification_failed ip=%s error=%q", clientIP, verr.Error())
				user.IDToken = nil
			}
		}

		if err := auth.SetUser(c, &user, secure); err != nil {
			duration := time.Since(startTime).Milliseconds()
			log.Printf("token_refresh_failed reason=set_user_failed ip=%s error=%q duration_ms=%d", clientIP, err.Error(), duration)
			return echo.NewHTTPError(http.StatusInternalServerError, "unable to set refreshed user: "+err.Error())
		}

		duration := time.Since(startTime).Milliseconds()
		log.Printf("token_refresh_complete ip=%s duration_ms=%d", clientIP, duration)

		// Respond OK. UI can read the short-lived 'user*' cookie to pick up tokens.
		return c.NoContent(http.StatusOK)
	}
}

// logout clears authentication cookies and redirects to root
func logout(secure bool) func(echo.Context) error {
	return func(c echo.Context) error {
		log.Printf("[Auth] User logout initiated from %s", c.RealIP())

		// Clear refresh token cookie
		clearCookie(c, "refresh", secure)
		log.Printf("[Auth] Cleared refresh token cookie")

		// Clear session start cookie
		clearCookie(c, "session_start", secure)

		// Clear user data cookies (user0, user1, etc.)
		// We don't know how many chunks exist, so clear up to 10
		for i := 0; i < 10; i++ {
			cookieName := "user" + strconv.Itoa(i)
			clearCookie(c, cookieName, secure)
		}
		log.Printf("[Auth] Cleared user data cookies")

		// Redirect to root (or login page)
		return c.Redirect(http.StatusSeeOther, "/")
	}
}

// clearCookie sets a cookie with MaxAge=-1 to delete it
func clearCookie(c echo.Context, name string, secure bool) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    "",
		MaxAge:   -1, // Instructs browser to delete cookie
		Path:     "/",
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	c.SetCookie(cookie)
}

func setCallbackCookie(c echo.Context, name, value string, secure bool) {
	// Explicitly expire pre v2.8.0 state and nonce cookies.
	// As they had different path, they were not being cleared and in some cases result in "state did not match" error.
	cookiePreV280 := &http.Cookie{
		Name:     name,
		Value:    "",
		MaxAge:   -1,
		Secure:   secure,
		Path:     "",
		HttpOnly: true,
	}
	c.SetCookie(cookiePreV280)

	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()),
		Secure:   secure,
		Path:     "/",
		HttpOnly: true,
	}
	c.SetCookie(cookie)
}

func randString() (string, error) {
	b := securecookie.GenerateRandomKey(16)
	if b == nil {
		return "", errors.New("unable to generate rand string for auth")
	}

	return base64.RawURLEncoding.EncodeToString(b), nil
}

func randNonce(c echo.Context, allowedOrigins []string) (string, error) {
	v, err := randString()
	if err != nil {
		return "", err
	}

	returnURL := c.QueryParam("returnUrl")
	if err := validateReturnURL(returnURL, allowedOrigins, c.Request().Host); err != nil {
		return "", err
	}

	n := &Nonce{
		Nonce:     v,
		ReturnURL: returnURL,
	}

	bytes, err := json.Marshal(n)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

func nonceFromString(nonce string) (*Nonce, error) {
	var n Nonce

	bytes, err := base64.RawURLEncoding.DecodeString(nonce)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(bytes, &n); err != nil {
		return nil, err
	}

	return &n, nil
}

type Nonce struct {
	Nonce     string `json:"nonce"`
	ReturnURL string `json:"return_url"`
}
