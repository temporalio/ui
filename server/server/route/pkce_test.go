package route

import (
	"context"
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
)

func TestAuthenticate_AddsPKCEParamsToAuthURL(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso?returnUrl=/dashboard", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid", "profile"},
	}

	handler := authenticate(oauthCfg, nil, []string{}, false, true)
	err := handler(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusFound, rec.Code)

	location := rec.Header().Get("Location")
	require.NotEmpty(t, location)

	parsed, err := url.Parse(location)
	require.NoError(t, err)

	query := parsed.Query()
	assert.Equal(t, "S256", query.Get("code_challenge_method"), "auth URL must include code_challenge_method=S256")
	assert.NotEmpty(t, query.Get("code_challenge"), "auth URL must include code_challenge")
	assert.NotEmpty(t, query.Get("state"), "auth URL must include state")
	assert.NotEmpty(t, query.Get("nonce"), "auth URL must include nonce")

	verifier := rootCookie(t, rec, "code_verifier").Value
	assert.Equal(t, oauth2.S256ChallengeFromVerifier(verifier), query.Get("code_challenge"),
		"the challenge in the auth URL must be the S256 hash of the cookie verifier")
}

func TestAuthenticate_SetsCodeVerifierCookie(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	handler := authenticate(oauthCfg, nil, []string{}, false, true)
	require.NoError(t, handler(c))

	cookie := rootCookie(t, rec, "code_verifier")
	assert.True(t, cookie.HttpOnly)
	assert.Equal(t, 3600, cookie.MaxAge, "the verifier cookie TTL must match the state cookie")
	assert.Equal(t, http.SameSiteLaxMode, cookie.SameSite)

	assert.GreaterOrEqual(t, len(cookie.Value), 43)
	assert.LessOrEqual(t, len(cookie.Value), 128)
	decoded, err := base64.RawURLEncoding.DecodeString(cookie.Value)
	require.NoError(t, err, "verifier must be unpadded base64url")
	assert.NotEmpty(t, decoded)
}

func TestAuthenticate_ExpiresPreV280StateCookie(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	handler := authenticate(oauthCfg, nil, []string{}, false, false)
	require.NoError(t, handler(c))

	var expired bool
	for _, ck := range cookiesNamed(rec, "state") {
		if ck.Path == "" && ck.MaxAge < 0 {
			expired = true
		}
	}
	assert.True(t, expired, "must set expired state cookie for pre-v2.8.0 cleanup")
}

func TestLogout_ClearsCodeVerifier(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/logout", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := logout(false)
	require.NoError(t, handler(c))

	assert.Less(t, rootCookie(t, rec, "code_verifier").MaxAge, 0, "logout must clear code_verifier cookie")
}

func TestAuthenticate_PKCEDisabled_NoChallengeParams(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	handler := authenticate(oauthCfg, nil, []string{}, false, false)
	err := handler(c)
	require.NoError(t, err)

	location := rec.Header().Get("Location")
	require.NotEmpty(t, location)

	parsed, err := url.Parse(location)
	require.NoError(t, err)

	query := parsed.Query()
	assert.Empty(t, query.Get("code_challenge_method"), "must NOT include code_challenge_method when PKCE disabled")
	assert.Empty(t, query.Get("code_challenge"), "must NOT include code_challenge when PKCE disabled")
	assert.NotEmpty(t, query.Get("state"), "auth URL must include state")
	assert.NotEmpty(t, query.Get("nonce"), "auth URL must include nonce")
}

func TestAuthenticate_PKCEDisabled_NoVerifierCookie(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	handler := authenticate(oauthCfg, nil, []string{}, false, false)
	require.NoError(t, handler(c))

	assert.Empty(t, cookiesNamed(rec, "code_verifier"),
		"must NOT set code_verifier cookie when PKCE disabled")
}

func TestAuthenticate_WithOptionsIncludesPKCE(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	options := map[string]interface{}{
		"audience": "test-audience",
	}

	handler := authenticate(oauthCfg, options, []string{}, false, true)
	require.NoError(t, handler(c))

	location := rec.Header().Get("Location")
	parsed, err := url.Parse(location)
	require.NoError(t, err)

	query := parsed.Query()
	assert.Equal(t, "S256", query.Get("code_challenge_method"))
	assert.NotEmpty(t, query.Get("code_challenge"))
	assert.Equal(t, "test-audience", query.Get("audience"))
}

func TestAuthenticate_PKCEOptionsWinOverProviderOptions(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://idp.example.com/auth",
			TokenURL: "https://idp.example.com/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	options := map[string]interface{}{
		"code_challenge":        "provider-challenge",
		"code_challenge_method": "plain",
		"audience":              "test-audience",
	}

	handler := authenticate(oauthCfg, options, []string{}, false, true)
	require.NoError(t, handler(c))

	parsed, err := url.Parse(rec.Header().Get("Location"))
	require.NoError(t, err)

	query := parsed.Query()
	verifier := rootCookie(t, rec, "code_verifier").Value
	assert.Equal(t, "S256", query.Get("code_challenge_method"))
	assert.Equal(t, oauth2.S256ChallengeFromVerifier(verifier), query.Get("code_challenge"))
	assert.Equal(t, "test-audience", query.Get("audience"))
}

func TestAuthenticate_StateAndNonceCookiesUnchangedWhenPKCEEnabled(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID:    "test-client",
		Endpoint:    oauth2.Endpoint{AuthURL: "https://idp.example.com/auth", TokenURL: "https://idp.example.com/token"},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	handler := authenticate(oauthCfg, nil, []string{}, false, true)
	require.NoError(t, handler(c))

	for _, name := range []string{"state", "nonce"} {
		cookie := rootCookie(t, rec, name)
		assert.Equal(t, 3600, cookie.MaxAge, "%s cookie TTL must stay at the main value of 1 hour", name)
		assert.Zero(t, cookie.SameSite, "%s cookie must keep the SameSite used on main", name)
		assert.True(t, cookie.HttpOnly)
	}
}

func TestAuthenticateCb_ClearsCodeVerifier_OnExchangeError(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := authenticateCb(context.Background(), &oauth2.Config{}, nil, time.Hour, 0, false)
	err := handler(c)
	require.Error(t, err)

	assert.Less(t, rootCookie(t, rec, "code_verifier").MaxAge, 0,
		"code_verifier must be cleared so it cannot be replayed across retries")
}

func cookiesNamed(rec *httptest.ResponseRecorder, name string) []*http.Cookie {
	var found []*http.Cookie
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == name {
			found = append(found, cookie)
		}
	}
	return found
}

func rootCookie(t *testing.T, rec *httptest.ResponseRecorder, name string) *http.Cookie {
	t.Helper()
	for _, cookie := range cookiesNamed(rec, name) {
		if cookie.Path == "/" {
			return cookie
		}
	}
	require.FailNowf(t, "missing cookie", "no %q cookie with Path=/, got %v", name, rec.Result().Cookies())
	return nil
}
