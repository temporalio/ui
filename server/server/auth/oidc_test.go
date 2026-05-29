package auth_test

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
	"net/url"
	"testing"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/temporalio/ui-server/v2/server/auth"
	"golang.org/x/oauth2"
)

type oidcTestHarness struct {
	server          *httptest.Server
	privateKey      *ecdsa.PrivateKey
	keyID           string
	lastTokenParams url.Values
	issuerURL       string
	nonce           string
}

func newOIDCTestHarness(t *testing.T) *oidcTestHarness {
	t.Helper()

	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	require.NoError(t, err)

	h := &oidcTestHarness{
		privateKey: key,
		keyID:      "test-key-id",
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/.well-known/openid-configuration", h.handleDiscovery)
	mux.HandleFunc("/token", h.handleToken)
	mux.HandleFunc("/keys", h.handleJWKS)

	h.server = httptest.NewServer(mux)
	h.issuerURL = h.server.URL

	return h
}

func (h *oidcTestHarness) Close() {
	h.server.Close()
}

func (h *oidcTestHarness) Provider(ctx context.Context) (*oidc.Provider, error) {
	return oidc.NewProvider(
		oidc.InsecureIssuerURLContext(ctx, h.issuerURL),
		h.issuerURL,
	)
}

func (h *oidcTestHarness) OAuth2Config() *oauth2.Config {
	return &oauth2.Config{
		ClientID: "test-client",
		Endpoint: oauth2.Endpoint{
			AuthURL:  h.issuerURL + "/auth",
			TokenURL: h.issuerURL + "/token",
		},
		Scopes: []string{"openid", "email"},
	}
}

type oidcDiscovery struct {
	Issuer                           string   `json:"issuer"`
	AuthorizationEndpoint            string   `json:"authorization_endpoint"`
	TokenEndpoint                    string   `json:"token_endpoint"`
	JWKSUri                          string   `json:"jwks_uri"`
	ResponseTypesSupported           []string `json:"response_types_supported"`
	SubjectTypesSupported            []string `json:"subject_types_supported"`
	IDTokenSigningAlgValuesSupported []string `json:"id_token_signing_alg_values_supported"`
}

func (h *oidcTestHarness) handleDiscovery(w http.ResponseWriter, r *http.Request) {
	disc := oidcDiscovery{
		Issuer:                h.issuerURL,
		AuthorizationEndpoint: h.issuerURL + "/auth",
		TokenEndpoint:         h.issuerURL + "/token",
		JWKSUri:               h.issuerURL + "/keys",
		ResponseTypesSupported:           []string{"code"},
		SubjectTypesSupported:            []string{"public"},
		IDTokenSigningAlgValuesSupported: []string{"ES256"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(disc)
}

type jwkKey struct {
	KTY string `json:"kty"`
	CRV string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
	KID string `json:"kid"`
	ALG string `json:"alg"`
	USE string `json:"use"`
}

type jwks struct {
	Keys []jwkKey `json:"keys"`
}

func (h *oidcTestHarness) handleJWKS(w http.ResponseWriter, r *http.Request) {
	pub := &h.privateKey.PublicKey
	x := base64.RawURLEncoding.EncodeToString(pub.X.Bytes())
	y := base64.RawURLEncoding.EncodeToString(pub.Y.Bytes())

	keys := jwks{Keys: []jwkKey{{
		KTY: "EC",
		CRV: "P-256",
		X:   x,
		Y:   y,
		KID: h.keyID,
		ALG: "ES256",
		USE: "sig",
	}}}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(keys)
}

func (h *oidcTestHarness) handleToken(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	h.lastTokenParams = r.PostForm

	now := time.Now()
	claims := map[string]interface{}{
		"iss":   h.issuerURL,
		"sub":   "test-user-id",
		"aud":   []string{"test-client"},
		"exp":   now.Add(time.Hour).Unix(),
		"iat":   now.Unix(),
		"nonce": h.nonce,
		"email": "test@example.com",
		"name":  "Test User",
	}
	idToken, err := signJWT(
		map[string]string{"alg": "ES256", "typ": "JWT", "kid": h.keyID},
		claims,
		h.privateKey,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"access_token":  "mock-access-token",
		"token_type":    "Bearer",
		"expires_in":    3600,
		"id_token":      idToken,
		"refresh_token": "mock-refresh-token",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func signJWT(header, payload interface{}, key *ecdsa.PrivateKey) (string, error) {
	hdr, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	pld, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	hdrB64 := base64.RawURLEncoding.EncodeToString(hdr)
	pldB64 := base64.RawURLEncoding.EncodeToString(pld)

	msg := hdrB64 + "." + pldB64
	hash := sha256.Sum256([]byte(msg))

	r, s, err := ecdsa.Sign(rand.Reader, key, hash[:])
	if err != nil {
		return "", err
	}

	rBytes := make([]byte, 32)
	sBytes := make([]byte, 32)
	r.FillBytes(rBytes)
	s.FillBytes(sBytes)

	sig := append(rBytes, sBytes...)
	sigB64 := base64.RawURLEncoding.EncodeToString(sig)

	return msg + "." + sigB64, nil
}

func TestExchangeCode_MissingCodeVerifier(t *testing.T) {
	harness := newOIDCTestHarness(t)
	defer harness.Close()

	provider, err := harness.Provider(context.Background())
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "test-state"})

	cfg := harness.OAuth2Config()
	_, err = auth.ExchangeCode(context.Background(), req, cfg, provider)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "Code verifier is not set")
}

func TestExchangeCode_WithPKCE(t *testing.T) {
	harness := newOIDCTestHarness(t)
	defer harness.Close()

	tokenNonce := "test-nonce-value"
	harness.nonce = tokenNonce

	provider, err := harness.Provider(context.Background())
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "test-state"})
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"})
	req.AddCookie(&http.Cookie{Name: "nonce", Value: tokenNonce})

	cfg := harness.OAuth2Config()
	user, err := auth.ExchangeCode(context.Background(), req, cfg, provider)
	require.NoError(t, err)
	require.NotNil(t, user)
	require.NotNil(t, user.OAuth2Token)
	assert.Equal(t, "mock-access-token", user.OAuth2Token.AccessToken)
	assert.Equal(t, "mock-refresh-token", user.OAuth2Token.RefreshToken)

	require.NotNil(t, user.IDToken)
	require.NotNil(t, user.IDToken.Claims)
	assert.Equal(t, "test@example.com", user.IDToken.Claims.Email)
	assert.Equal(t, "Test User", user.IDToken.Claims.Name)

	require.NotNil(t, harness.lastTokenParams)
	assert.Equal(t, "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
		harness.lastTokenParams.Get("code_verifier"),
		"code_verifier must be sent to token endpoint")
}

func TestExchangeCode_StateMismatch(t *testing.T) {
	harness := newOIDCTestHarness(t)
	defer harness.Close()

	provider, err := harness.Provider(context.Background())
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=wrong-state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "expected-state"})
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "test-verifier"})
	req.AddCookie(&http.Cookie{Name: "nonce", Value: "test-nonce"})

	cfg := harness.OAuth2Config()
	_, err = auth.ExchangeCode(context.Background(), req, cfg, provider)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "State cookie did not match")
}

func TestExchangeCode_NonceMismatch(t *testing.T) {
	harness := newOIDCTestHarness(t)
	defer harness.Close()

	provider, err := harness.Provider(context.Background())
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodGet, "/auth/sso/callback?code=test-code&state=test-state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "test-state"})
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"})
	req.AddCookie(&http.Cookie{Name: "nonce", Value: "expected-nonce"})

	cfg := harness.OAuth2Config()
	_, err = auth.ExchangeCode(context.Background(), req, cfg, provider)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "Nonce did not match")
}
