package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/temporalio/ui-server/v2/server/config"
)

type mockConfigProvider struct {
	cfg *config.Config
}

func (m *mockConfigProvider) GetConfig() (*config.Config, error) {
	return m.cfg, nil
}

func TestGetSettingsIncludesAuthRedirectToProvider(t *testing.T) {
	cfg := &config.Config{}
	cfg.Auth.Enabled = true
	cfg.Auth.RedirectToProvider = true
	cfg.Auth.Providers = []config.AuthProvider{
		{
			Options: map[string]interface{}{
				"audience": "temporal",
			},
		},
	}

	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/settings", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err = GetSettings(cfgProvider)(c)
	require.NoError(t, err)

	var settings SettingsResponse
	err = json.Unmarshal(rec.Body.Bytes(), &settings)
	require.NoError(t, err)

	assert.True(t, settings.Auth.Enabled)
	assert.True(t, settings.Auth.RedirectToProvider)
	assert.Contains(t, settings.Auth.Options, "audience")
}
