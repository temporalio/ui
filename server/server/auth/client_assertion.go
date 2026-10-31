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

package auth

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"

	"golang.org/x/oauth2"
)

const clientAssertionType = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"

// WithClientAssertionFile returns a context whose token endpoint requests authenticate with the JWT in path (RFC 7523) instead of a client secret.
func WithClientAssertionFile(ctx context.Context, cfg *oauth2.Config, path string) context.Context {
	cfg.ClientSecret = ""
	cfg.Endpoint.AuthStyle = oauth2.AuthStyleInParams
	client := &http.Client{Transport: &clientAssertionTransport{
		tokenURL: cfg.Endpoint.TokenURL,
		path:     path,
		next:     http.DefaultTransport,
	}}
	return context.WithValue(ctx, oauth2.HTTPClient, client)
}

type clientAssertionTransport struct {
	tokenURL string
	path     string
	next     http.RoundTripper
}

func (t *clientAssertionTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	if r.Method != http.MethodPost || r.URL.String() != t.tokenURL {
		return t.next.RoundTrip(r)
	}

	// Read on every request: projected tokens such as Kubernetes service account tokens are rotated in place.
	raw, err := os.ReadFile(t.path)
	if err != nil {
		return nil, fmt.Errorf("unable to read client assertion: %w", err)
	}
	assertion := strings.TrimSpace(string(raw))
	if assertion == "" {
		return nil, fmt.Errorf("client assertion file %s is empty", t.path)
	}

	body, err := io.ReadAll(r.Body)
	r.Body.Close()
	if err != nil {
		return nil, err
	}
	form, err := url.ParseQuery(string(body))
	if err != nil {
		return nil, err
	}
	form.Set("client_assertion_type", clientAssertionType)
	form.Set("client_assertion", assertion)
	encoded := form.Encode()

	r = r.Clone(r.Context())
	r.Body = io.NopCloser(strings.NewReader(encoded))
	r.ContentLength = int64(len(encoded))
	return t.next.RoundTrip(r)
}
