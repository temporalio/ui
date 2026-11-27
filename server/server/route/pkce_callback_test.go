package route

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
)

type pkceIdP struct {
	server *httptest.Server
	key    *ecdsa.PrivateKey
	kid    string
	nonce  string
}

func newPKCEIdP(t *testing.T, nonce string) *pkceIdP {
	t.Helper()

	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	require.NoError(t, err)

	idp := &pkceIdP{key: key, kid: "pkce-test-key", nonce: nonce}

	mux := http.NewServeMux()
	mux.HandleFunc("/.well-known/openid-configuration", idp.handleDiscovery)
	mux.HandleFunc("/jwks", idp.handleJWKS)
	mux.HandleFunc("/token", idp.handleToken)
	idp.server = httptest.NewServer(mux)
	t.Cleanup(idp.server.Close)

	return idp
}

func writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *pkceIdP) handleDiscovery(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]any{
		"issuer":                                h.server.URL,
		"authorization_endpoint":                h.server.URL + "/auth",
		"token_endpoint":                        h.server.URL + "/token",
		"jwks_uri":                              h.server.URL + "/jwks",
		"response_types_supported":              []string{"code"},
		"subject_types_supported":               []string{"public"},
		"id_token_signing_alg_values_supported": []string{"ES256"},
		"code_challenge_methods_supported":      []string{"S256", "plain"},
	})
}

func (h *pkceIdP) handleJWKS(w http.ResponseWriter, r *http.Request) {
	pub := &h.key.PublicKey
	writeJSON(w, map[string]any{
		"keys": []map[string]string{{
			"kty": "EC",
			"crv": "P-256",
			"x":   base64.RawURLEncoding.EncodeToString(pub.X.Bytes()),
			"y":   base64.RawURLEncoding.EncodeToString(pub.Y.Bytes()),
			"kid": h.kid,
			"alg": "ES256",
			"use": "sig",
		}},
	})
}

func (h *pkceIdP) handleToken(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	now := time.Now()
	idToken, err := signES256JWT(
		map[string]string{"alg": "ES256", "typ": "JWT", "kid": h.kid},
		map[string]any{
			"iss":   h.server.URL,
			"sub":   "pkce-test-user",
			"aud":   "test-client",
			"exp":   now.Add(time.Hour).Unix(),
			"iat":   now.Unix(),
			"nonce": h.nonce,
			"email": "test@example.com",
			"name":  "Test User",
		},
		h.key,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]any{
		"access_token": "pkce-access-token",
		"token_type":   "Bearer",
		"expires_in":   3600,
		"id_token":     idToken,
	})
}

func signES256JWT(header, payload any, key *ecdsa.PrivateKey) (string, error) {
	hdr, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	encoded := base64.RawURLEncoding.EncodeToString
	unsigned := encoded(hdr) + "." + encoded(body)

	digest := sha256.Sum256([]byte(unsigned))
	r, s, err := ecdsa.Sign(rand.Reader, key, digest[:])
	if err != nil {
		return "", err
	}

	rBytes, sBytes := make([]byte, 32), make([]byte, 32)
	r.FillBytes(rBytes)
	s.FillBytes(sBytes)

	return unsigned + "." + encoded(append(rBytes, sBytes...)), nil
}

func TestAuthenticateCb_ClearsCodeVerifier_OnSuccessPath(t *testing.T) {
	nonceJSON, err := json.Marshal(&Nonce{Nonce: "pkce-nonce", ReturnURL: "/workflows"})
	require.NoError(t, err)
	nonceCookie := base64.RawURLEncoding.EncodeToString(nonceJSON)

	idp := newPKCEIdP(t, nonceCookie)

	provider, err := oidc.NewProvider(context.Background(), idp.server.URL)
	require.NoError(t, err)

	oauthCfg := &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  idp.server.URL + "/auth",
			TokenURL: idp.server.URL + "/token",
		},
		RedirectURL: "https://app.example.com/auth/sso/callback",
		Scopes:      []string{"openid"},
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "test-state"})
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"})
	req.AddCookie(&http.Cookie{Name: "nonce", Value: nonceCookie})
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	handler := authenticateCb(context.Background(), oauthCfg, provider, time.Hour, 0, false)
	require.NoError(t, handler(c))

	require.Equal(t, http.StatusSeeOther, rec.Code)
	require.Equal(t, "/workflows", rec.Header().Get("Location"))

	assert.Less(t, rootCookie(t, rec, "code_verifier").MaxAge, 0,
		"the verifier cookie must be delivered to the browser on the success path, where the handler ends with a redirect")
}
