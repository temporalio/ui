// The MIT License
//
// Copyright (c) 2020 Temporal Technologies Inc.  All rights reserved.
//
// Copyright (c) 2020 Uber Technologies, Inc.
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
	"encoding/base64"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// testJWT builds an unsigned token with the shape of a JWT. Only the payload is
// read, so the header and signature segments just need to be present.
func testJWT(t *testing.T, payload string) string {
	t.Helper()
	enc := base64.RawURLEncoding.EncodeToString
	return fmt.Sprintf("%s.%s.%s",
		enc([]byte(`{"alg":"RS256","typ":"JWT"}`)),
		enc([]byte(payload)),
		"c2lnbmF0dXJl",
	)
}

func TestJwtExp(t *testing.T) {
	exp := time.Date(2030, time.January, 2, 3, 4, 5, 0, time.UTC)

	t.Run("reads the exp claim", func(t *testing.T) {
		token := testJWT(t, fmt.Sprintf(`{"sub":"user","exp":%d}`, exp.Unix()))

		got, ok := jwtExp(token)

		require.True(t, ok)
		assert.Equal(t, exp.Unix(), got.Unix())
	})

	t.Run("accepts a fractional exp", func(t *testing.T) {
		token := testJWT(t, fmt.Sprintf(`{"exp":%d.75}`, exp.Unix()))

		got, ok := jwtExp(token)

		require.True(t, ok)
		assert.Equal(t, exp.Unix(), got.Unix())
	})

	t.Run("tolerates base64 padding", func(t *testing.T) {
		payload := base64.URLEncoding.EncodeToString([]byte(fmt.Sprintf(`{"sub":"u","exp":%d}`, exp.Unix())))
		require.Contains(t, payload, "=", "this case is only meaningful with padding present")

		got, ok := jwtExp("aGVhZGVy." + payload + ".c2ln")

		require.True(t, ok)
		assert.Equal(t, exp.Unix(), got.Unix())
	})

	rejected := map[string]string{
		"opaque token":     "0dGhpcy1pcy1ub3QtYS1qd3Q",
		"empty":            "",
		"two segments":     "aGVhZGVy.cGF5bG9hZA",
		"four segments":    "a.b.c.d",
		"payload not b64":  "aGVhZGVy.!!!not-base64!!!.c2ln",
		"payload not json": testJWT(t, `not json at all`),
		"no exp claim":     testJWT(t, `{"sub":"user"}`),
		"exp is a string":  testJWT(t, `{"exp":"tomorrow"}`),
		"exp is zero":      testJWT(t, `{"exp":0}`),
		"exp is negative":  testJWT(t, `{"exp":-1}`),
	}

	for name, token := range rejected {
		t.Run("rejects "+name, func(t *testing.T) {
			_, ok := jwtExp(token)
			assert.False(t, ok)
		})
	}
}

func TestRefreshCookieMaxAge(t *testing.T) {
	now := time.Date(2030, time.June, 1, 12, 0, 0, 0, time.UTC)
	jwtExpiringIn := func(d time.Duration) string {
		return testJWT(t, fmt.Sprintf(`{"exp":%d}`, now.Add(d).Unix()))
	}

	tests := map[string]struct {
		refreshToken string
		configured   time.Duration
		want         time.Duration
	}{
		"exp claim wins over configured value": {
			refreshToken: jwtExpiringIn(30 * time.Minute),
			configured:   24 * time.Hour,
			want:         30 * time.Minute,
		},
		"exp claim is used when nothing is configured": {
			refreshToken: jwtExpiringIn(12 * time.Hour),
			want:         12 * time.Hour,
		},
		"opaque token falls back to the configured value": {
			refreshToken: "opaque-refresh-token",
			configured:   24 * time.Hour,
			want:         24 * time.Hour,
		},
		"opaque token with no configured value falls back to the default": {
			refreshToken: "opaque-refresh-token",
			want:         defaultRefreshCookieDuration,
		},
		"already expired exp claim falls back to the configured value": {
			refreshToken: jwtExpiringIn(-time.Hour),
			configured:   24 * time.Hour,
			want:         24 * time.Hour,
		},
		"already expired exp claim with no configured value falls back to the default": {
			refreshToken: jwtExpiringIn(-time.Hour),
			want:         defaultRefreshCookieDuration,
		},
		"a very long lived token is capped": {
			refreshToken: jwtExpiringIn(365 * 24 * time.Hour),
			want:         maxRefreshCookieDuration,
		},
		"a very long configured value is capped": {
			refreshToken: "opaque-refresh-token",
			configured:   365 * 24 * time.Hour,
			want:         maxRefreshCookieDuration,
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			got := refreshCookieMaxAge(tt.refreshToken, tt.configured, now)
			assert.Equal(t, int(tt.want.Seconds()), got)
		})
	}
}

func TestUserCookieMaxAge(t *testing.T) {
	now := time.Date(2030, time.June, 1, 12, 0, 0, 0, time.UTC)

	tests := map[string]struct {
		sessionExpiresAt time.Time
		want             int
	}{
		"no max session duration configured": {
			sessionExpiresAt: time.Time{},
			want:             60,
		},
		"session outlasts the cookie": {
			sessionExpiresAt: now.Add(8 * time.Hour),
			want:             60,
		},
		"session ends exactly when the cookie would": {
			sessionExpiresAt: now.Add(time.Minute),
			want:             60,
		},
		"session ends before the cookie would": {
			sessionExpiresAt: now.Add(10 * time.Second),
			want:             10,
		},
		"session has under a second left": {
			sessionExpiresAt: now.Add(500 * time.Millisecond),
			want:             1,
		},
		"session is already over": {
			sessionExpiresAt: now.Add(-time.Hour),
			want:             1,
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			got := userCookieMaxAge(tt.sessionExpiresAt, now)
			assert.Equal(t, tt.want, got)
			assert.Positive(t, got, "MaxAge of 0 would make this a session cookie")
		})
	}
}
