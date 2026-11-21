package route

import (
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"golang.org/x/oauth2"
)

func TestCookieSecureForCallbackURL(t *testing.T) {
	tests := map[string]struct {
		callbackURL string
		want        bool
		wantErr     bool
	}{
		"https": {
			callbackURL: "https://temporal.example.com/auth/sso/callback",
			want:        true,
		},
		"https with port": {
			callbackURL: "https://temporal.example.com:8080/auth/sso/callback",
			want:        true,
		},
		"http": {
			callbackURL: "http://localhost:8080/auth/sso/callback",
			want:        false,
		},
		"uppercase scheme is normalized": {
			callbackURL: "HTTPS://temporal.example.com/auth/sso/callback",
			want:        true,
		},
		"missing scheme": {
			callbackURL: "temporal.example.com/auth/sso/callback",
			wantErr:     true,
		},
		"empty": {
			callbackURL: "",
			wantErr:     true,
		},
		"unsupported scheme": {
			callbackURL: "ftp://temporal.example.com/auth/sso/callback",
			wantErr:     true,
		},
		"unparseable": {
			callbackURL: "https://temporal.example.com/auth/sso/callback\x7f",
			wantErr:     true,
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			a := assert.New(t)

			got, err := cookieSecureForCallbackURL(tt.callbackURL)

			if tt.wantErr {
				a.Error(err)
				a.False(got, "must not report Secure when the callback URL is rejected")
				return
			}

			a.NoError(err)
			a.Equal(tt.want, got)
		})
	}
}

func TestAuthenticateKeepsNonceShort(t *testing.T) {
	cfg := &oauth2.Config{
		ClientID:    "client",
		RedirectURL: "https://ui.example.com/auth/sso/callback",
		Endpoint:    oauth2.Endpoint{AuthURL: "https://idp.example.com/authorize"},
	}
	returnURL := "/namespaces/default/workflows?query=" + strings.Repeat("a", 80)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso?returnUrl="+url.QueryEscape(returnURL), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NoError(t, authenticate(cfg, nil, nil, true)(c))

	loc, err := url.Parse(rec.Header().Get("Location"))
	assert.NoError(t, err)
	nonce := loc.Query().Get("nonce")
	assert.NotEmpty(t, nonce)
	// FAPI 2.0 identity providers reject nonces longer than 64 characters.
	assert.LessOrEqual(t, len(nonce), 64)

	cookies := map[string]string{}
	for _, ck := range rec.Result().Cookies() {
		cookies[ck.Name] = ck.Value
	}
	assert.Equal(t, nonce, cookies["nonce"])
	assert.Equal(t, returnURL, cookies["return_url"])
}

func TestAuthenticateClearsStaleReturnURL(t *testing.T) {
	cfg := &oauth2.Config{Endpoint: oauth2.Endpoint{AuthURL: "https://idp.example.com/authorize"}}
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso", nil)
	req.AddCookie(&http.Cookie{Name: "return_url", Value: "/old"})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.NoError(t, authenticate(cfg, nil, nil, true)(c))

	cleared := false
	for _, ck := range rec.Result().Cookies() {
		if ck.Name == "return_url" {
			assert.Negative(t, ck.MaxAge)
			cleared = true
		}
	}
	assert.True(t, cleared, "return_url cookie should be cleared")
}

func TestAuthenticateRejectsDisallowedReturnURL(t *testing.T) {
	cfg := &oauth2.Config{Endpoint: oauth2.Endpoint{AuthURL: "https://idp.example.com/authorize"}}
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso?returnUrl="+url.QueryEscape("https://evil.example.org/x"), nil)
	c := e.NewContext(req, httptest.NewRecorder())

	err := authenticate(cfg, nil, nil, true)(c)
	var httpErr *echo.HTTPError
	assert.ErrorAs(t, err, &httpErr)
	assert.Equal(t, http.StatusBadRequest, httpErr.Code)
}

func TestReturnURLFromRequest(t *testing.T) {
	legacyNonce := base64.RawURLEncoding.EncodeToString([]byte(`{"nonce":"abc","return_url":"/legacy"}`))

	tests := []struct {
		name    string
		cookies []*http.Cookie
		want    string
	}{
		{"return_url cookie", []*http.Cookie{{Name: "nonce", Value: "opaque"}, {Name: "return_url", Value: "/new"}}, "/new"},
		{"legacy JSON nonce", []*http.Cookie{{Name: "nonce", Value: legacyNonce}}, "/legacy"},
		{"opaque nonce only", []*http.Cookie{{Name: "nonce", Value: "opaque"}}, "/"},
		{"no cookies", nil, "/"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback", nil)
			for _, ck := range tt.cookies {
				req.AddCookie(ck)
			}
			c := echo.New().NewContext(req, httptest.NewRecorder())
			assert.Equal(t, tt.want, returnURLFromRequest(c))
		})
	}
}
