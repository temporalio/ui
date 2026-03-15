package auth

import (
	"encoding/base64"
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func makeTestJWT(payload map[string]any) string {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"none"}`))
	b, _ := json.Marshal(payload)
	return header + "." + base64.RawURLEncoding.EncodeToString(b) + ".sig"
}

func TestJWTExp(t *testing.T) {
	future := time.Now().Add(2 * time.Hour).Unix()
	past := time.Now().Add(-1 * time.Hour).Unix()

	tests := []struct {
		name      string
		token     string
		wantOK    bool
		wantAfter time.Time
	}{
		{
			name:      "valid JWT with future exp",
			token:     makeTestJWT(map[string]any{"exp": future}),
			wantOK:    true,
			wantAfter: time.Now(),
		},
		{
			name:      "valid JWT with past exp",
			token:     makeTestJWT(map[string]any{"exp": past}),
			wantOK:    true,
			wantAfter: time.Time{},
		},
		{
			name:   "JWT missing exp field",
			token:  makeTestJWT(map[string]any{"sub": "user123"}),
			wantOK: false,
		},
		{
			name:   "JWT with exp zero",
			token:  makeTestJWT(map[string]any{"exp": 0}),
			wantOK: false,
		},
		{
			name:   "opaque token",
			token:  "opaque-refresh-token",
			wantOK: false,
		},
		{
			name:   "malformed base64 payload",
			token:  "header.!!!invalid!!!.sig",
			wantOK: false,
		},
		{
			name:   "only two parts",
			token:  "header.payload",
			wantOK: false,
		},
		{
			name:   "four parts",
			token:  "a.b.c.d",
			wantOK: false,
		},
		{
			name:   "empty string",
			token:  "",
			wantOK: false,
		},
		{
			name:   "valid base64 payload but not JSON",
			token:  "header." + base64.RawURLEncoding.EncodeToString([]byte("not-json")) + ".sig",
			wantOK: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, ok := jwtExp(tt.token)
			assert.Equal(t, tt.wantOK, ok, "jwtExp ok mismatch")
			if tt.wantOK && !tt.wantAfter.IsZero() {
				assert.True(t, got.After(tt.wantAfter), "expected exp to be in the future, got %v", got)
			}
		})
	}
}
