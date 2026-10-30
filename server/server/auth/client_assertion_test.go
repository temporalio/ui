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

package auth_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"

	"github.com/temporalio/ui-server/v2/server/auth"
)

func newTokenServer(t *testing.T, forms *[]url.Values) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.NoError(t, r.ParseForm())
		_, _, basic := r.BasicAuth()
		assert.False(t, basic, "basic auth must not be sent with a client assertion")
		*forms = append(*forms, r.PostForm)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"access_token":"a","token_type":"Bearer","refresh_token":"r","expires_in":3600}`))
	}))
	t.Cleanup(srv.Close)
	return srv
}

func TestWithClientAssertionFile(t *testing.T) {
	var forms []url.Values
	srv := newTokenServer(t, &forms)
	path := filepath.Join(t.TempDir(), "token")
	require.NoError(t, os.WriteFile(path, []byte("first-jwt\n"), 0o600))

	cfg := &oauth2.Config{
		ClientID:     "client-id",
		ClientSecret: "ignored",
		Endpoint:     oauth2.Endpoint{TokenURL: srv.URL + "/token"},
	}
	ctx := auth.WithClientAssertionFile(context.Background(), cfg, path)

	_, err := cfg.Exchange(ctx, "code")
	require.NoError(t, err)

	require.NoError(t, os.WriteFile(path, []byte("rotated-jwt"), 0o600))
	_, err = cfg.TokenSource(ctx, &oauth2.Token{RefreshToken: "r"}).Token()
	require.NoError(t, err)

	require.Len(t, forms, 2)
	for i, want := range []struct{ grant, assertion string }{
		{"authorization_code", "first-jwt"},
		{"refresh_token", "rotated-jwt"},
	} {
		f := forms[i]
		assert.Equal(t, want.grant, f.Get("grant_type"))
		assert.Equal(t, want.assertion, f.Get("client_assertion"))
		assert.Equal(t, "urn:ietf:params:oauth:client-assertion-type:jwt-bearer", f.Get("client_assertion_type"))
		assert.Equal(t, "client-id", f.Get("client_id"))
		assert.False(t, f.Has("client_secret"))
	}
}

func TestWithClientAssertionFileErrors(t *testing.T) {
	var forms []url.Values
	srv := newTokenServer(t, &forms)
	dir := t.TempDir()
	empty := filepath.Join(dir, "empty")
	require.NoError(t, os.WriteFile(empty, []byte("\n"), 0o600))

	for name, path := range map[string]string{
		"missing file": filepath.Join(dir, "missing"),
		"empty file":   empty,
	} {
		t.Run(name, func(t *testing.T) {
			cfg := &oauth2.Config{ClientID: "client-id", Endpoint: oauth2.Endpoint{TokenURL: srv.URL + "/token"}}
			ctx := auth.WithClientAssertionFile(context.Background(), cfg, path)

			_, err := cfg.Exchange(ctx, "code")
			assert.Error(t, err)
		})
	}
	assert.Empty(t, forms, "no request may reach the token endpoint without an assertion")
}
