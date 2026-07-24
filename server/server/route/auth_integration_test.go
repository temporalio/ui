package route

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/go-jose/go-jose/v4"
	josejwt "github.com/go-jose/go-jose/v4/jwt"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/temporalio/ui-server/v2/server/config"
)

// mockOIDCServer creates a minimal OIDC provider server for integration testing.
// It serves discovery, JWKS, and token endpoints. The token endpoint returns an
// ID token containing the specified extraClaims in addition to standard claims.
//
// The server stores a nonce that will be embedded in the ID token. The test must
// call SetNonce before triggering the callback so the token's nonce matches the
// cookie value that ExchangeCode validates.
type mockOIDCServer struct {
	Server      *httptest.Server
	PrivateKey  *rsa.PrivateKey
	ExtraClaims map[string]interface{}

	mu    sync.Mutex
	nonce string // nonce to embed in the ID token
}

func newMockOIDCServer(t *testing.T, extraClaims map[string]interface{}) *mockOIDCServer {
	t.Helper()

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)

	m := &mockOIDCServer{
		PrivateKey:  privateKey,
		ExtraClaims: extraClaims,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/.well-known/openid-configuration", m.handleDiscovery)
	mux.HandleFunc("/jwks", m.handleJWKS)
	mux.HandleFunc("/token", m.handleToken)

	m.Server = httptest.NewServer(mux)
	return m
}

// SetNonce sets the nonce value that will be embedded in the next ID token.
// This must match the nonce cookie value that ExchangeCode reads.
func (m *mockOIDCServer) SetNonce(nonce string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.nonce = nonce
}

func (m *mockOIDCServer) getNonce() string {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.nonce
}

func (m *mockOIDCServer) handleDiscovery(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"issuer":                 m.Server.URL,
		"authorization_endpoint": m.Server.URL + "/authorize",
		"token_endpoint":         m.Server.URL + "/token",
		"jwks_uri":               m.Server.URL + "/jwks",
		"userinfo_endpoint":      m.Server.URL + "/userinfo",
		"id_token_signing_alg_values_supported": []string{"RS256"},
	})
}

func (m *mockOIDCServer) handleJWKS(w http.ResponseWriter, _ *http.Request) {
	jwk := jose.JSONWebKey{Key: &m.PrivateKey.PublicKey, Algorithm: "RS256", Use: "sig", KeyID: "test-key-1"}
	jwks := jose.JSONWebKeySet{Keys: []jose.JSONWebKey{jwk}}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jwks)
}

func (m *mockOIDCServer) handleToken(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	// Build the ID token with standard + extra claims
	now := time.Now()
	claims := map[string]interface{}{
		"iss":            m.Server.URL,
		"sub":            "test-user-123",
		"aud":            "test-client",
		"email":          "test@example.com",
		"email_verified": true,
		"name":           "Test User",
		"nonce":          m.getNonce(), // must match the nonce cookie value
		"iat":            now.Unix(),
		"exp":            now.Add(time.Hour).Unix(),
	}
	for k, v := range m.ExtraClaims {
		claims[k] = v
	}

	// Sign the token
	signerOpts := &jose.SignerOptions{}
	signerOpts = signerOpts.WithHeader(jose.HeaderKey("kid"), "test-key-1")
	signer, _ := jose.NewSigner(
		jose.SigningKey{Algorithm: jose.RS256, Key: m.PrivateKey},
		signerOpts,
	)
	rawToken, _ := josejwt.Signed(signer).Claims(claims).Serialize()

	// Respond with OAuth2 token response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token": "fake-access-token",
		"token_type":   "Bearer",
		"expires_in":   3600,
		"id_token":     rawToken,
	})
}

// TestAuthenticateCb_ClaimAuthorization is an integration test that verifies
// the full OIDC callback flow with claim-based authorization.
// It starts a mock OIDC server, configures the UI server's auth callback,
// and verifies that users are allowed or denied based on their claims.
func TestAuthenticateCb_ClaimAuthorization(t *testing.T) {
	tests := []struct {
		name           string
		extraClaims    map[string]interface{} // claims to include in the ID token
		allowedKey     string                 // config: allowedClaimKey
		allowedValues  []string               // config: allowedClaimValues
		expectStatus   int                    // expected HTTP status
		expectRedirect bool                   // whether we expect a redirect to "/"
	}{
		{
			name:           "no allowlist configured - all users allowed",
			extraClaims:    map[string]interface{}{"groups": []string{"random-group"}},
			allowedKey:     "",
			allowedValues:  nil,
			expectStatus:   http.StatusSeeOther,
			expectRedirect: true,
		},
		{
			name:           "user has required group - allowed",
			extraClaims:    map[string]interface{}{"groups": []string{"readers", "temporal-admins", "users"}},
			allowedKey:     "groups",
			allowedValues:  []string{"temporal-admins"},
			expectStatus:   http.StatusSeeOther,
			expectRedirect: true,
		},
		{
			name:           "user has one of multiple allowed groups - allowed",
			extraClaims:    map[string]interface{}{"groups": []string{"ops-team"}},
			allowedKey:     "groups",
			allowedValues:  []string{"temporal-admins", "ops-team"},
			expectStatus:   http.StatusSeeOther,
			expectRedirect: true,
		},
		{
			name:          "user lacks required group - denied",
			extraClaims:   map[string]interface{}{"groups": []string{"readers", "users"}},
			allowedKey:    "groups",
			allowedValues: []string{"temporal-admins"},
			expectStatus:  http.StatusForbidden,
		},
		{
			name:          "user has no groups claim at all - denied",
			extraClaims:   map[string]interface{}{},
			allowedKey:    "groups",
			allowedValues: []string{"temporal-admins"},
			expectStatus:  http.StatusForbidden,
		},
		{
			name: "nested claim (Keycloak-style) - allowed",
			extraClaims: map[string]interface{}{
				"realm_access": map[string]interface{}{
					"roles": []string{"user", "temporal-admin"},
				},
			},
			allowedKey:     "realm_access.roles",
			allowedValues:  []string{"temporal-admin"},
			expectStatus:   http.StatusSeeOther,
			expectRedirect: true,
		},
		{
			name: "nested claim (Keycloak-style) - denied",
			extraClaims: map[string]interface{}{
				"realm_access": map[string]interface{}{
					"roles": []string{"user", "viewer"},
				},
			},
			allowedKey:    "realm_access.roles",
			allowedValues: []string{"temporal-admin"},
			expectStatus:  http.StatusForbidden,
		},
		{
			name:           "string claim match - allowed",
			extraClaims:    map[string]interface{}{"role": "admin"},
			allowedKey:     "role",
			allowedValues:  []string{"admin", "superadmin"},
			expectStatus:   http.StatusSeeOther,
			expectRedirect: true,
		},
		{
			name:          "string claim no match - denied",
			extraClaims:   map[string]interface{}{"role": "viewer"},
			allowedKey:    "role",
			allowedValues: []string{"admin", "superadmin"},
			expectStatus:  http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Start a mock OIDC server with the test's extra claims
			oidcServer := newMockOIDCServer(t, tt.extraClaims)
			defer oidcServer.Server.Close()

			// Create the provider config
			providerCfg := config.AuthProvider{
				Label:              "test",
				Type:               "oidc",
				ProviderURL:        oidcServer.Server.URL,
				ClientID:           "test-client",
				ClientSecret:       "test-secret",
				CallbackURL:        "http://localhost/auth/sso/callback",
				Scopes:             []string{"openid", "profile", "email"},
				AllowedClaimKey:    tt.allowedKey,
				AllowedClaimValues: tt.allowedValues,
			}

			// Build the full server config
			serverCfg := &config.Config{
				TemporalGRPCAddress: "127.0.0.1:7233",
				Auth: config.Auth{
					Enabled:   true,
					Providers: []config.AuthProvider{providerCfg},
				},
			}

			// Create config provider
			cfgProvider, err := config.NewConfigProviderWithRefresh(serverCfg)
			require.NoError(t, err)

			// Set up the Echo instance with auth routes
			e := echo.New()
			SetAuthRoutes(e, cfgProvider)

			// Generate a nonce (the base64-encoded JSON struct used as cookie value).
			// The OIDC server must embed this exact value in the ID token's nonce claim
			// because ExchangeCode compares idToken.Nonce == cookie("nonce").Value.
			nonceCookie, err := randNonce(
				e.NewContext(
					httptest.NewRequest(http.MethodGet, "/", nil),
					httptest.NewRecorder(),
				),
				nil,
			)
			require.NoError(t, err)

			// Tell the mock OIDC server what nonce to embed in the ID token
			oidcServer.SetNonce(nonceCookie)

			state, err := randString()
			require.NoError(t, err)

			// Build the callback request with code, state, and cookies
			path := fmt.Sprintf("/auth/sso/callback?code=test-auth-code&state=%s", state)
			req := httptest.NewRequest(http.MethodGet, path, nil)
			req.AddCookie(&http.Cookie{Name: "state", Value: state})
			req.AddCookie(&http.Cookie{Name: "nonce", Value: nonceCookie})

			rec := httptest.NewRecorder()
			ctx := e.NewContext(req, rec)

			// Find and execute the callback handler
			e.Router().Find(http.MethodGet, "/auth/sso/callback", ctx)
			err = ctx.Handler()(ctx)

			if tt.expectStatus == http.StatusForbidden {
				// Echo wraps errors as HTTPError
				assert.Error(t, err)
				httpErr, ok := err.(*echo.HTTPError)
				require.True(t, ok, "expected echo.HTTPError, got %T", err)
				assert.Equal(t, http.StatusForbidden, httpErr.Code)
				assert.Contains(t, httpErr.Message, "access denied")
			} else if tt.expectRedirect {
				// Successful auth results in a redirect
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				assert.Equal(t, tt.expectStatus, rec.Code)
				location := rec.Header().Get("Location")
				assert.Equal(t, "/", location)
			}
		})
	}
}
