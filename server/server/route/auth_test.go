package route

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/temporalio/ui-server/v2/server/config"
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

func TestValidateAuthConfig_NoProviders(t *testing.T) {
	err := validateAuthConfig(&config.Auth{
		Enabled:   true,
		Providers: []config.AuthProvider{},
	})

	assert.Error(t, err)
}

func TestValidateAuthConfig_CaFileAndCaDataMutuallyExclusive(t *testing.T) {
	err := validateAuthConfig(&config.Auth{
		Enabled: true,
		Providers: []config.AuthProvider{
			{
				CaFile: "file",
				CaData: "data",
			},
		},
	})

	assert.Error(t, err)
}

func TestValidateAuthConfig_ValidConfig(t *testing.T) {
	err := validateAuthConfig(&config.Auth{
		Enabled: true,
		Providers: []config.AuthProvider{
			{
				ProviderURL: "https://example.com",
				ClientID:    "id",
				CallbackURL: "https://example.com/callback",
				CaFile:      "file",
			},
		},
	})

	assert.NoError(t, err)
}
