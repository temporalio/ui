package route

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/temporalio/ui-server/v2/server/config"
)

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
