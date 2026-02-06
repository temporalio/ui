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

package auth_test

import (
	_ "embed"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/temporalio/ui-server/v2/server/auth"
	"github.com/temporalio/ui-server/v2/server/config"
	"golang.org/x/oauth2"
)

// func TestSetUser(t *testing.T) {
// user := auth.User{
// 	OAuth2Token: &oauth2.Token{
// 		AccessToken: "XXX.YYY.ZZZ",
// 	},
// 	IDToken: &auth.IDToken{
// 		RawToken: "MMM.JJJ.NNN",
// 		Claims: auth.Claims{
// 			Email:         "test@email.com",
// 			EmailVerified: true,
// 			Name:          "test-name",
// 			Picture:       "test-picture",
// 		},
// 	},
// }

// 	html = auth.SetUser(nil, &user)

// 	assert.Contains(t, string(html), fmt.Sprintf(metaT, "access-token", user.OAuth2Token.AccessToken))
// 	assert.Contains(t, string(html), fmt.Sprintf(metaT, "id-token", user.IDToken.RawToken))
// 	assert.Contains(t, string(html), fmt.Sprintf(metaT, "user-name", user.IDToken.Claims.Name))
// 	assert.Contains(t, string(html), fmt.Sprintf(metaT, "user-email", user.IDToken.Claims.Email))
// 	assert.Contains(t, string(html), fmt.Sprintf(metaT, "user-picture", user.IDToken.Claims.Picture))
// }

func TestSetUser(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(echo.GET, "/", nil)
	rec := httptest.NewRecorder()

	tests := map[string]struct {
		user    auth.User
		ctx     echo.Context
		wantErr bool
	}{
		"user empty": {
			user:    auth.User{},
			ctx:     e.NewContext(req, rec),
			wantErr: true,
		},
		"user set": {
			user: auth.User{
				OAuth2Token: &oauth2.Token{
					AccessToken: "XXX.YYY.ZZZ",
				},
				IDToken: &auth.IDToken{
					RawToken: "MMM.JJJ.NNN",
					Claims: &auth.Claims{
						Email:         "test@email.com",
						EmailVerified: true,
						Name:          "test-name",
						Picture:       "test-picture",
					},
				},
			},
			ctx: e.NewContext(req, rec),
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			err := auth.SetUser(tt.ctx, &tt.user)
			cookies := tt.ctx.Cookies()

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, cookies)
				return
			} else {
				assert.NoError(t, err)
				setCookie := tt.ctx.Response().Header().Get(echo.HeaderSetCookie)
				assert.Contains(t, setCookie, "user0")
			}
		})
	}
}

func TestValidateAuthHeaderExists(t *testing.T) {
	tests := []struct {
		name                 string
		authEnabled          bool
		useIDTokenAsBearer   bool
		authHeader           string
		authExtrasHeader     string
		expectedAuthHeader   string
		expectedError        bool
	}{
		{
			name:          "auth disabled - no validation",
			authEnabled:   false,
			authHeader:    "",
			expectedError: false,
		},
		{
			name:          "auth enabled - no auth header",
			authEnabled:   true,
			authHeader:    "",
			expectedError: true,
		},
		{
			name:          "auth enabled - with auth header",
			authEnabled:   true,
			authHeader:    "Bearer access-token",
			expectedError: false,
		},
		{
			name:               "useIDTokenAsBearer disabled - headers unchanged",
			authEnabled:        true,
			useIDTokenAsBearer: false,
			authHeader:         "Bearer access-token",
			authExtrasHeader:   "id-token",
			expectedAuthHeader: "Bearer access-token",
			expectedError:      false,
		},
		{
			name:               "useIDTokenAsBearer enabled - swap tokens",
			authEnabled:        true,
			useIDTokenAsBearer: true,
			authHeader:         "Bearer access-token",
			authExtrasHeader:   "id-token",
			expectedAuthHeader: "Bearer id-token",
			expectedError:      false,
		},
		{
			name:               "useIDTokenAsBearer enabled - no extras header",
			authEnabled:        true,
			useIDTokenAsBearer: true,
			authHeader:         "Bearer access-token",
			authExtrasHeader:   "",
			expectedAuthHeader: "Bearer access-token",
			expectedError:      false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			e := echo.New()
			req := httptest.NewRequest(echo.GET, "/", nil)
			if tt.authHeader != "" {
				req.Header.Set(echo.HeaderAuthorization, tt.authHeader)
			}
			if tt.authExtrasHeader != "" {
				req.Header.Set("authorization-extras", tt.authExtrasHeader)
			}
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			// Create config provider
			cfg := &config.Config{
				Auth: config.Auth{
					Enabled: tt.authEnabled,
				},
			}
			if tt.useIDTokenAsBearer {
				cfg.Auth.Providers = []config.AuthProvider{
					{
						UseIDTokenAsBearer: true,
					},
				}
			}
			cfgProvider, err := config.NewConfigProviderWithRefresh(cfg)
			assert.NoError(t, err)

			// Execute
			err = auth.ValidateAuthHeaderExists(c, cfgProvider)

			// Assert
			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				if tt.expectedAuthHeader != "" {
					assert.Equal(t, tt.expectedAuthHeader, c.Request().Header.Get(echo.HeaderAuthorization))
				}
				// When useIDTokenAsBearer is enabled and extras header exists, it should be removed
				if tt.useIDTokenAsBearer && tt.authExtrasHeader != "" {
					assert.Empty(t, c.Request().Header.Get("authorization-extras"))
				}
			}
		})
	}
}
