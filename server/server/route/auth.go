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
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gorilla/securecookie"
	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui/server/v2/server/auth"
	"github.com/temporalio/ui/server/v2/server/config"
	"golang.org/x/net/context"
	"golang.org/x/oauth2"
)

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

	oauthCfg := oauth2.Config{
		ClientID:     providerCfg.ClientID,
		ClientSecret: providerCfg.ClientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  providerCfg.CallbackURL,
		Scopes:       providerCfg.Scopes,
	}

	api := e.Group("/auth")
	api.GET("/sso", authenticate(&oauthCfg, providerCfg.Options))
	api.GET("/sso/callback", authenticateCb(ctx, &oauthCfg, provider))
	api.GET("/sso_callback", authenticateCb(ctx, &oauthCfg, provider)) // compatibility with UI v1
}

func authenticate(config *oauth2.Config, options map[string]interface{}) func(echo.Context) error {
	return func(c echo.Context) error {
		state, err := randString()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err)
		}
		nonce, err := randNonce(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err)
		}
		setCallbackCookie(c, "state", state)
		setCallbackCookie(c, "nonce", nonce)

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

func authenticateCb(ctx context.Context, oauthCfg *oauth2.Config, provider *oidc.Provider) func(echo.Context) error {
	return func(c echo.Context) error {
		user, err := auth.ExchangeCode(ctx, c.Request(), oauthCfg, provider)
		if err != nil {
			return err
		}

		err = auth.SetUser(c, user)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "unable to set user: "+err.Error())
		}

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

func setCallbackCookie(c echo.Context, name, value string) {
	// Explicitly expire pre v2.8.0 state and nonce cookies.
	// As they had different path, they were not being cleared and in some cases result in "state did not match" error.
	cookiePreV280 := &http.Cookie{
		Name:     name,
		Value:    "",
		MaxAge:   -1,
		Secure:   c.Request().TLS != nil,
		Path:     "",
		HttpOnly: true,
	}
	c.SetCookie(cookiePreV280)

	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()),
		Secure:   c.Request().TLS != nil,
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

func randNonce(c echo.Context) (string, error) {
	v, err := randString()
	if err != nil {
		return "", err
	}

	returnURL := c.QueryParam("returnUrl")

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
