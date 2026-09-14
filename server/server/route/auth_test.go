package route

import (
	"testing"

	"github.com/stretchr/testify/assert"
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
