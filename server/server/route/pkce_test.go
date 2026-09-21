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

func TestRandCodeVerifier_GeneratesValidVerifier(t *testing.T) {
	v, err := randCodeVerifier()
	require.NoError(t, err)
	require.NotEmpty(t, v)

	// PKCE verifier must be 43-128 characters (RFC 7636 §4.1). Our
	// implementation uses 64 random bytes which encodes to 86 chars.
	assert.GreaterOrEqual(t, len(v), 43)
	assert.LessOrEqual(t, len(v), 128)

	// Must be valid base64url (no padding)
	decoded, err := base64.RawURLEncoding.DecodeString(v)
	require.NoError(t, err)
	assert.Len(t, decoded, 64)
}

func TestRandCodeVerifier_GeneratesUniqueValues(t *testing.T) {
	v1, err := randCodeVerifier()
	require.NoError(t, err)

	v2, err := randCodeVerifier()
	require.NoError(t, err)

	assert.NotEqual(t, v1, v2)
}

func TestSHA256CodeChallenge_RFC7636TestVector(t *testing.T) {
	// RFC 7636 Appendix B test vector
	verifier := "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
	expected := "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

	challenge := sha256CodeChallenge(verifier)
	assert.Equal(t, expected, challenge)
}

func TestSHA256CodeChallenge_Deterministic(t *testing.T) {
	verifier := "test-verifier-12345"
	c1 := sha256CodeChallenge(verifier)
	c2 := sha256CodeChallenge(verifier)
	assert.Equal(t, c1, c2)
}

func TestAuthenticate_AddsPKCEParamsToAuthURL(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso?returnUrl=/dashboard", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	oauthCfg := &oauth2.Config{
		ClientID:    "test-client",
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
	err := handler(c)
	require.NoError(t, err)

	setCookieHeaders := rec.Header().Values("Set-Cookie")
	var codeVerifierCookie string
	for _, h := range setCookieHeaders {
		if containsCookieName(h, "code_verifier") && containsPathRoot(h) {
			codeVerifierCookie = h
			break
		}
	}
	require.NotEmpty(t, codeVerifierCookie, "must set code_verifier cookie with Path=/")

	// The cookie should be HttpOnly and have a MaxAge
	assert.Contains(t, codeVerifierCookie, "HttpOnly")
	assert.Contains(t, codeVerifierCookie, "Max-Age=")
	assert.Contains(t, codeVerifierCookie, "Path=/")
}

func TestAuthenticate_SetsCallbackCookieForPreV280(t *testing.T) {
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
	err := handler(c)
	require.NoError(t, err)

	setCookieHeaders := rec.Header().Values("Set-Cookie")

	// Should have an expired code_verifier cookie with empty path (pre-v2.8.0 cleanup)
	var expiredCookie string
	for _, h := range setCookieHeaders {
		if containsCookieName(h, "code_verifier") && containsMaxAgeZeroOrNegative(h) {
			expiredCookie = h
			break
		}
	}
	assert.NotEmpty(t, expiredCookie, "must set expired code_verifier cookie for pre-v2.8.0 cleanup")
}

func TestLogout_ClearsCodeVerifier(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/logout", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := logout(false)
	err := handler(c)
	require.NoError(t, err)

	setCookieHeaders := rec.Header().Values("Set-Cookie")
	var cleared bool
	for _, h := range setCookieHeaders {
		if containsCookieName(h, "code_verifier") {
			cleared = containsMaxAgeZeroOrNegative(h)
		}
	}
	assert.True(t, cleared, "logout should clear code_verifier cookie")
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
	err := handler(c)
	require.NoError(t, err)

	setCookieHeaders := rec.Header().Values("Set-Cookie")
	for _, h := range setCookieHeaders {
		assert.False(t, containsCookieName(h, "code_verifier"),
			"must NOT set code_verifier cookie when PKCE disabled")
	}
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
	err := handler(c)
	require.NoError(t, err)

	location := rec.Header().Get("Location")
	parsed, err := url.Parse(location)
	require.NoError(t, err)

	query := parsed.Query()
	assert.Equal(t, "S256", query.Get("code_challenge_method"))
	assert.NotEmpty(t, query.Get("code_challenge"))
	assert.Equal(t, "test-audience", query.Get("audience"))
}

func TestAuthenticate_CodeVerifierCookie_HasSameSiteLax(t *testing.T) {
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

	setCookieHeaders := rec.Header().Values("Set-Cookie")
	var found bool
	for _, h := range setCookieHeaders {
		if containsCookieName(h, "code_verifier") && containsPathRoot(h) {
			found = true
			assert.Contains(t, h, "SameSite=Lax",
				"code_verifier cookie must use SameSite=Lax so it survives the IdP redirect")
		}
	}
	assert.True(t, found, "code_verifier cookie with Path=/ must be set")
}

func TestAuthenticate_CodeVerifierCookie_HasShortTTL(t *testing.T) {
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

	for _, name := range []string{"state", "nonce", "code_verifier"} {
		var found bool
		for _, h := range rec.Header().Values("Set-Cookie") {
			if containsCookieName(h, name) && containsPathRoot(h) {
				found = true
				assertMaxAgeWithin(t, h, 5*60, 1, "auth callback cookies should have a short (5-minute) TTL")
			}
		}
		assert.True(t, found, "%s cookie with Path=/ must be set", name)
	}
}

func TestAuthenticate_StateAndNonceCookies_HaveSameSiteLax(t *testing.T) {
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

	handler := authenticate(oauthCfg, nil, []string{}, false, false)
	require.NoError(t, handler(c))

	for _, name := range []string{"state", "nonce"} {
		var found bool
		for _, h := range rec.Header().Values("Set-Cookie") {
			if containsCookieName(h, name) && containsPathRoot(h) {
				found = true
				assert.Contains(t, h, "SameSite=Lax",
					"%s cookie must use SameSite=Lax", name)
			}
		}
		assert.True(t, found, "%s cookie with Path=/ must be set", name)
	}
}

func TestAuthenticateCb_ClearsCodeVerifier_OnExchangeError(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	// Provide a code_verifier cookie so we can verify it gets cleared, but
	// omit the state cookie so ExchangeCode fails fast before contacting the IdP.
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := authenticateCb(context.Background(), &oauth2.Config{}, nil, time.Hour, false, true)
	err := handler(c)
	require.Error(t, err)

	// The code_verifier cookie must be cleared even though ExchangeCode
	// failed — this prevents the verifier from being replayed across retries.
	var cleared bool
	for _, h := range rec.Header().Values("Set-Cookie") {
		if containsCookieName(h, "code_verifier") && containsMaxAgeZeroOrNegative(h) {
			cleared = true
			break
		}
	}
	assert.True(t, cleared, "code_verifier must be cleared via defer on error path")
}

func TestAuthenticateCb_DoesNotClearCodeVerifier_WhenPKCEDisabled(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := authenticateCb(context.Background(), &oauth2.Config{}, nil, time.Hour, false, false)
	err := handler(c)
	require.Error(t, err)

	for _, h := range rec.Header().Values("Set-Cookie") {
		assert.False(t, containsCookieName(h, "code_verifier"),
			"must not emit code_verifier Set-Cookie when PKCE disabled")
	}
}

// Test helpers

func containsCookieName(header, name string) bool {
	prefix := name + "="
	for _, part := range splitCookieHeader(header) {
		part = trimSpace(part)
		if len(part) >= len(prefix) && part[:len(prefix)] == prefix {
			return true
		}
	}
	return false
}

func containsPathRoot(header string) bool {
	for _, part := range splitCookieHeader(header) {
		part = trimSpace(part)
		if part == "Path=/" {
			return true
		}
	}
	return false
}

func containsMaxAgeZeroOrNegative(header string) bool {
	for _, part := range splitCookieHeader(header) {
		part = trimSpace(part)
		if len(part) > 8 && part[:8] == "Max-Age=" {
			val := part[8:]
			return val == "0" || len(val) > 0 && val[0] == '-'
		}
	}
	return false
}

func maxAgeFromHeader(header string) (int, bool) {
	for _, part := range splitCookieHeader(header) {
		part = trimSpace(part)
		if len(part) > 8 && part[:8] == "Max-Age=" {
			val := part[8:]
			n := 0
			for _, ch := range val {
				if ch < '0' || ch > '9' {
					return 0, false
				}
				n = n*10 + int(ch-'0')
			}
			return n, true
		}
	}
	return 0, false
}

func assertMaxAgeWithin(t *testing.T, header string, expected, tolerance int, msg string) {
	t.Helper()
	got, ok := maxAgeFromHeader(header)
	require.True(t, ok, "%s: header must contain numeric Max-Age, got %q", msg, header)
	assert.InDelta(t, expected, got, float64(tolerance), "%s: Max-Age=%d, expected ~%d", msg, got, expected)
}

func splitCookieHeader(header string) []string {
	var parts []string
	start := 0
	for i := 0; i < len(header); i++ {
		if header[i] == ';' {
			parts = append(parts, trimSpace(header[start:i]))
			start = i + 1
		}
	}
	if start < len(header) {
		parts = append(parts, trimSpace(header[start:]))
	}
	return parts
}

func trimSpace(s string) string {
	start, end := 0, len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	if start > 0 || end < len(s) {
		return s[start:end]
	}
	return s
}
