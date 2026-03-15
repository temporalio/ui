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
	"encoding/base64"
	"encoding/json"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

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
			err := auth.SetUser(tt.ctx, &tt.user, time.Time{}, 0)
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

func TestSetUserCookieMaxAge(t *testing.T) {
	validUser := auth.User{
		OAuth2Token: &oauth2.Token{AccessToken: "XXX.YYY.ZZZ"},
	}

	extractMaxAge := func(header string) int {
		for _, part := range strings.Split(header, ";") {
			part = strings.TrimSpace(part)
			if strings.HasPrefix(strings.ToLower(part), "max-age=") {
				val := strings.SplitN(part, "=", 2)[1]
				n, _ := strconv.Atoi(val)
				return n
			}
		}
		return -1
	}

	tests := []struct {
		name             string
		sessionExpiresAt time.Time
		wantMaxAge       func(got int) bool
		desc             string
	}{
		{
			name:             "no session limit uses 60s",
			sessionExpiresAt: time.Time{},
			wantMaxAge:       func(got int) bool { return got == 60 },
			desc:             "zero sessionExpiresAt should default to 60s",
		},
		{
			name:             "session expires in 2 minutes keeps 60s",
			sessionExpiresAt: time.Now().Add(2 * time.Minute),
			wantMaxAge:       func(got int) bool { return got == 60 },
			desc:             "remaining > 60s should still use 60s",
		},
		{
			name:             "session expires in 30 seconds caps to ~30s",
			sessionExpiresAt: time.Now().Add(30 * time.Second),
			wantMaxAge:       func(got int) bool { return got > 25 && got <= 30 },
			desc:             "remaining < 60s should cap MaxAge to remaining",
		},
		{
			name:             "session already expired clamps to 1",
			sessionExpiresAt: time.Now().Add(-5 * time.Second),
			wantMaxAge:       func(got int) bool { return got == 1 },
			desc:             "expired session should clamp MaxAge to 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(echo.GET, "/", nil)
			rec := httptest.NewRecorder()
			ctx := e.NewContext(req, rec)

			err := auth.SetUser(ctx, &validUser, tt.sessionExpiresAt, 0)
			assert.NoError(t, err, tt.desc)

			setCookie := rec.Header().Get(echo.HeaderSetCookie)
			assert.Contains(t, setCookie, "user0", tt.desc)

			maxAge := extractMaxAge(setCookie)
			assert.True(t, tt.wantMaxAge(maxAge), "%s: got MaxAge=%d", tt.desc, maxAge)
		})
	}
}

func TestSetUserRefreshCookieMaxAge(t *testing.T) {
	extractCookieMaxAge := func(headers []string, name string) int {
		for _, h := range headers {
			parts := strings.Split(h, ";")
			if !strings.HasPrefix(strings.TrimSpace(parts[0]), name+"=") {
				continue
			}
			for _, part := range parts[1:] {
				part = strings.TrimSpace(part)
				if strings.HasPrefix(strings.ToLower(part), "max-age=") {
					n, _ := strconv.Atoi(strings.SplitN(part, "=", 2)[1])
					return n
				}
			}
		}
		return -1
	}

	userWithRefresh := auth.User{
		OAuth2Token: &oauth2.Token{
			AccessToken:  "XXX.YYY.ZZZ",
			RefreshToken: "REFRESH",
		},
	}

	tests := []struct {
		name                 string
		refreshTokenDuration time.Duration
		wantMaxAge           func(got int) bool
		desc                 string
	}{
		{
			name:                 "zero duration uses 7-day default",
			refreshTokenDuration: 0,
			wantMaxAge:           func(got int) bool { return got == int((7 * 24 * time.Hour).Seconds()) },
			desc:                 "unset refreshTokenDuration with opaque token should fall back to 7 days",
		},
		{
			name:                 "configured duration is used directly",
			refreshTokenDuration: 24 * time.Hour,
			wantMaxAge:           func(got int) bool { return got == int((24 * time.Hour).Seconds()) },
			desc:                 "refreshTokenDuration=24h should set MaxAge to 86400s",
		},
		{
			name:                 "short duration is respected",
			refreshTokenDuration: 30 * time.Minute,
			wantMaxAge:           func(got int) bool { return got == int((30 * time.Minute).Seconds()) },
			desc:                 "refreshTokenDuration=30m should set MaxAge to 1800s",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(echo.GET, "/", nil)
			rec := httptest.NewRecorder()
			ctx := e.NewContext(req, rec)

			err := auth.SetUser(ctx, &userWithRefresh, time.Time{}, tt.refreshTokenDuration)
			assert.NoError(t, err, tt.desc)

			maxAge := extractCookieMaxAge(rec.Header().Values(echo.HeaderSetCookie), "refresh")
			assert.True(t, tt.wantMaxAge(maxAge), "%s: got MaxAge=%d", tt.desc, maxAge)
		})
	}
}

// makeJWT builds a minimal unsigned JWT with the given exp unix timestamp.
func makeJWT(exp int64) string {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"none"}`))
	payload, _ := json.Marshal(map[string]int64{"exp": exp})
	return header + "." + base64.RawURLEncoding.EncodeToString(payload) + ".sig"
}

func TestSetUserRefreshCookieJWTExp(t *testing.T) {
	extractCookieMaxAge := func(headers []string, name string) int {
		for _, h := range headers {
			parts := strings.Split(h, ";")
			if !strings.HasPrefix(strings.TrimSpace(parts[0]), name+"=") {
				continue
			}
			for _, part := range parts[1:] {
				part = strings.TrimSpace(part)
				if strings.HasPrefix(strings.ToLower(part), "max-age=") {
					n, _ := strconv.Atoi(strings.SplitN(part, "=", 2)[1])
					return n
				}
			}
		}
		return -1
	}

	tests := []struct {
		name       string
		token      string
		wantMaxAge func(got int) bool
		desc       string
	}{
		{
			name:       "JWT exp used when no config",
			token:      makeJWT(time.Now().Add(12 * time.Hour).Unix()),
			wantMaxAge: func(got int) bool { return got > int((11*time.Hour+55*time.Minute).Seconds()) && got <= int((12*time.Hour).Seconds()) },
			desc:       "should derive MaxAge from JWT exp when refreshTokenDuration is unset",
		},
		{
			name:       "opaque token falls back to 7-day default",
			token:      "opaque-refresh-token",
			wantMaxAge: func(got int) bool { return got == int((7 * 24 * time.Hour).Seconds()) },
			desc:       "non-JWT token should fall back to 7-day default",
		},
		{
			name:       "JWT with past exp falls back to 7-day default",
			token:      makeJWT(time.Now().Add(-1 * time.Hour).Unix()),
			wantMaxAge: func(got int) bool { return got == int((7 * 24 * time.Hour).Seconds()) },
			desc:       "expired JWT exp should fall back to 7-day default",
		},
	}

	jwtOverrideTests := []struct {
		name                 string
		token                string
		refreshTokenDuration time.Duration
		wantMaxAge           func(got int) bool
		desc                 string
	}{
		{
			name:                 "JWT exp takes priority over configured duration",
			token:                makeJWT(time.Now().Add(6 * time.Hour).Unix()),
			refreshTokenDuration: 24 * time.Hour,
			wantMaxAge:           func(got int) bool { return got > int((5*time.Hour+55*time.Minute).Seconds()) && got <= int((6*time.Hour).Seconds()) },
			desc:                 "JWT exp should override refreshTokenDuration when present",
		},
		{
			name:                 "expired JWT exp falls back to configured duration",
			token:                makeJWT(time.Now().Add(-1 * time.Hour).Unix()),
			refreshTokenDuration: 24 * time.Hour,
			wantMaxAge:           func(got int) bool { return got == int((24 * time.Hour).Seconds()) },
			desc:                 "expired JWT exp should fall back to refreshTokenDuration config",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(echo.GET, "/", nil)
			rec := httptest.NewRecorder()
			ctx := e.NewContext(req, rec)

			user := auth.User{
				OAuth2Token: &oauth2.Token{
					AccessToken:  "XXX.YYY.ZZZ",
					RefreshToken: tt.token,
				},
			}

			err := auth.SetUser(ctx, &user, time.Time{}, 0)
			assert.NoError(t, err, tt.desc)

			maxAge := extractCookieMaxAge(rec.Header().Values(echo.HeaderSetCookie), "refresh")
			assert.True(t, tt.wantMaxAge(maxAge), "%s: got MaxAge=%d", tt.desc, maxAge)
		})
	}

	for _, tt := range jwtOverrideTests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(echo.GET, "/", nil)
			rec := httptest.NewRecorder()
			ctx := e.NewContext(req, rec)

			user := auth.User{
				OAuth2Token: &oauth2.Token{
					AccessToken:  "XXX.YYY.ZZZ",
					RefreshToken: tt.token,
				},
			}

			err := auth.SetUser(ctx, &user, time.Time{}, tt.refreshTokenDuration)
			assert.NoError(t, err, tt.desc)

			maxAge := extractCookieMaxAge(rec.Header().Values(echo.HeaderSetCookie), "refresh")
			assert.True(t, tt.wantMaxAge(maxAge), "%s: got MaxAge=%d", tt.desc, maxAge)
		})
	}
}

func TestValidateAuthHeaderExists(t *testing.T) {
	tests := []struct {
		name               string
		authEnabled        bool
		useIDTokenAsBearer bool
		authHeader         string
		authExtrasHeader   string
		expectedAuthHeader string
		expectedError      bool
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
