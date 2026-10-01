// The MIT License
//
// Copyright (c) 2020 Temporal Technologies Inc.  All rights reserved.
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

package route

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/net/context"
	"golang.org/x/oauth2"
)

// These tests drive the real /auth/refresh handler against a real identity
// provider token endpoint over HTTP, and read the cookies off the wire, so the
// behaviour under test is the whole refresh round trip rather than a helper.
//
// The refresh path is where both reported bugs surface. It is the request that
// fails with a 401 when the refresh cookie was given the access token's lifetime
// (#3210), and it is the request that reissues user* cookies which can outlive the
// session boundary (#3223).

// fakeIdP serves an OAuth2 token endpoint that returns a fixed token response.
type fakeIdP struct {
	*httptest.Server
	requests int
}

// newFakeIdP starts a token endpoint returning the given response body. The
// caller supplies expires_in and refresh_token so each test can describe the
// provider it is standing in for.
func newFakeIdP(t *testing.T, tokenResponse map[string]any) *fakeIdP {
	t.Helper()

	idp := &fakeIdP{}
	idp.Server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idp.requests++
		w.Header().Set("Content-Type", "application/json")
		require.NoError(t, json.NewEncoder(w).Encode(tokenResponse))
	}))
	t.Cleanup(idp.Close)

	return idp
}

// signedLikeJWT builds a token with the three segment shape of a JWT carrying the
// given exp. Keycloak and other providers issue refresh tokens of this form.
func signedLikeJWT(t *testing.T, exp time.Time) string {
	t.Helper()
	enc := base64.RawURLEncoding.EncodeToString
	return fmt.Sprintf("%s.%s.%s",
		enc([]byte(`{"alg":"RS256","typ":"JWT"}`)),
		enc([]byte(fmt.Sprintf(`{"sub":"test-user","typ":"Refresh","exp":%d}`, exp.Unix()))),
		"c2lnbmF0dXJl",
	)
}

// doRefresh runs the refresh handler and returns the cookies it set.
func doRefresh(t *testing.T, idp *fakeIdP, maxSessionDuration, refreshTokenDuration time.Duration, sessionStartedAt time.Time) map[string]*http.Cookie {
	t.Helper()

	oauthCfg := &oauth2.Config{
		ClientID:     "temporal-ui",
		ClientSecret: "temporal-secret",
		Endpoint:     oauth2.Endpoint{TokenURL: idp.URL + "/token"},
	}

	req := httptest.NewRequest(http.MethodGet, "/auth/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh", Value: "the-refresh-token-held-by-the-browser"})
	if !sessionStartedAt.IsZero() {
		req.AddCookie(&http.Cookie{Name: "session_start", Value: strconv.FormatInt(sessionStartedAt.Unix(), 10)})
	}

	rec := httptest.NewRecorder()
	c := echo.New().NewContext(req, rec)

	// provider is only dereferenced to verify an id_token, which these responses
	// deliberately omit so the test needs no signing keys.
	handler := refreshTokens(context.Background(), oauthCfg, nil, maxSessionDuration, refreshTokenDuration, false)
	require.NoError(t, handler(c))
	require.Equal(t, http.StatusOK, rec.Code)
	require.Equal(t, 1, idp.requests, "the handler should have exchanged the refresh token exactly once")

	got := map[string]*http.Cookie{}
	for _, cookie := range rec.Result().Cookies() {
		got[cookie.Name] = cookie
	}
	return got
}

// TestRefreshCookieOutlivesTheAccessToken is the regression test for #3210.
//
// The provider reports expires_in=5, describing its access token, while issuing a
// refresh token good for seven days. Deriving the refresh cookie from expires_in
// dropped it after five seconds, so the next refresh had no cookie to send and
// came back 401.
func TestRefreshCookieOutlivesTheAccessToken(t *testing.T) {
	const accessTokenTTL = 5 * time.Second
	refreshTokenTTL := 7 * 24 * time.Hour

	idp := newFakeIdP(t, map[string]any{
		"access_token":  "new-access-token",
		"refresh_token": signedLikeJWT(t, time.Now().Add(refreshTokenTTL)),
		"token_type":    "Bearer",
		"expires_in":    int(accessTokenTTL.Seconds()),
	})

	cookies := doRefresh(t, idp, 0, 0, time.Time{})

	refresh := cookies["refresh"]
	require.NotNil(t, refresh, "the handler must reissue the refresh cookie")
	assert.Greater(t, refresh.MaxAge, int(accessTokenTTL.Seconds()),
		"the refresh cookie must not expire with the access token")
	assert.InDelta(t, refreshTokenTTL.Seconds(), refresh.MaxAge, 5,
		"the refresh cookie should track the refresh token's own exp claim")
	assert.True(t, refresh.HttpOnly, "the refresh token must stay out of reach of scripts")
}

// TestRefreshCookieForOpaqueTokenUsesConfiguredDuration covers the providers that
// issue opaque refresh tokens, whose lifetime the server cannot read and which the
// operator therefore declares in config.
func TestRefreshCookieForOpaqueTokenUsesConfiguredDuration(t *testing.T) {
	idp := newFakeIdP(t, map[string]any{
		"access_token":  "new-access-token",
		"refresh_token": "an-entirely-opaque-refresh-token",
		"token_type":    "Bearer",
		"expires_in":    5,
	})

	cookies := doRefresh(t, idp, 0, 24*time.Hour, time.Time{})

	refresh := cookies["refresh"]
	require.NotNil(t, refresh)
	assert.Equal(t, int((24 * time.Hour).Seconds()), refresh.MaxAge)
}

// TestRefreshCookieForOpaqueTokenFallsBackToDefault covers an opaque refresh token
// from a provider the operator has not configured a lifetime for.
func TestRefreshCookieForOpaqueTokenFallsBackToDefault(t *testing.T) {
	idp := newFakeIdP(t, map[string]any{
		"access_token":  "new-access-token",
		"refresh_token": "an-entirely-opaque-refresh-token",
		"token_type":    "Bearer",
		"expires_in":    5,
	})

	cookies := doRefresh(t, idp, 0, 0, time.Time{})

	refresh := cookies["refresh"]
	require.NotNil(t, refresh)
	assert.Equal(t, int((7 * 24 * time.Hour).Seconds()), refresh.MaxAge)
}

// TestUserCookiesNeverOutliveTheSession is the regression test for the cookie half
// of #3223.
//
// This is the last refresh before the session boundary. The user* cookies used to
// be reissued with a flat sixty seconds, so the browser kept presenting a
// signed-in UI for another thirty seconds after the server had stopped honouring
// the session, and every API call in that window returned 401.
func TestUserCookiesNeverOutliveTheSession(t *testing.T) {
	const maxSessionDuration = 90 * time.Second
	sessionStartedAt := time.Now().Add(-60 * time.Second) // 30s of session left

	idp := newFakeIdP(t, map[string]any{
		"access_token":  "new-access-token",
		"refresh_token": "an-entirely-opaque-refresh-token",
		"token_type":    "Bearer",
		"expires_in":    5,
	})

	cookies := doRefresh(t, idp, maxSessionDuration, 0, sessionStartedAt)

	user := cookies["user0"]
	require.NotNil(t, user, "the handler must reissue the user cookie")
	assert.InDelta(t, 30, user.MaxAge, 2, "the user cookie should expire with the session")
	assert.Less(t, user.MaxAge, 60, "the user cookie must not outlive the session boundary")
	assert.Positive(t, user.MaxAge, "a MaxAge of 0 would make this a session cookie")
}

// TestUserCookiesKeepDefaultWhenSessionHasRoom checks the clamp only bites near the
// boundary, and leaves the ordinary case alone.
func TestUserCookiesKeepDefaultWhenSessionHasRoom(t *testing.T) {
	idp := newFakeIdP(t, map[string]any{
		"access_token":  "new-access-token",
		"refresh_token": "an-entirely-opaque-refresh-token",
		"token_type":    "Bearer",
		"expires_in":    5,
	})

	cookies := doRefresh(t, idp, 8*time.Hour, 0, time.Now())

	user := cookies["user0"]
	require.NotNil(t, user)
	assert.Equal(t, 60, user.MaxAge)
}

// TestUserCookiesUnaffectedWithoutMaxSessionDuration is the default deployment,
// where no session limit is configured and nothing should change.
func TestUserCookiesUnaffectedWithoutMaxSessionDuration(t *testing.T) {
	idp := newFakeIdP(t, map[string]any{
		"access_token":  "new-access-token",
		"refresh_token": "an-entirely-opaque-refresh-token",
		"token_type":    "Bearer",
		"expires_in":    5,
	})

	cookies := doRefresh(t, idp, 0, 0, time.Time{})

	user := cookies["user0"]
	require.NotNil(t, user)
	assert.Equal(t, 60, user.MaxAge)
}
