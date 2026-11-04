// The MIT License
//
// Copyright (c) 2026 Temporal Technologies Inc.  All rights reserved.
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

package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuthProviderValidateClientCredentials(t *testing.T) {
	dir := t.TempDir()
	tokenFile := filepath.Join(dir, "token")
	require.NoError(t, os.WriteFile(tokenFile, []byte("jwt"), 0o600))
	missingFile := filepath.Join(dir, "missing")

	tests := map[string]struct {
		secret, assertionFile string
		wantErr               bool
	}{
		"secret":                 {secret: "s"},
		"assertion file":         {assertionFile: tokenFile},
		"neither":                {},
		"both are rejected":      {secret: "s", assertionFile: tokenFile, wantErr: true},
		"missing assertion file": {assertionFile: missingFile, wantErr: true},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			auth := &Auth{Enabled: true, Providers: []AuthProvider{{
				ProviderURL:         "https://idp.example.com/",
				ClientID:            "client-id",
				CallbackURL:         "https://temporal.example.com/auth/sso/callback",
				ClientSecret:        tt.secret,
				ClientAssertionFile: tt.assertionFile,
			}}}

			err := auth.Validate()

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
