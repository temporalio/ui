package api

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/temporalio/ui-server/v2/server/config"
	workflowservice "go.temporal.io/api/workflowservice/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/test/bufconn"
)

type mockConfigProvider struct {
	cfg *config.Config
}

type accessCheckWorkflowService struct {
	workflowservice.UnimplementedWorkflowServiceServer
}

func (s *accessCheckWorkflowService) GetSystemInfo(
	ctx context.Context,
	_ *workflowservice.GetSystemInfoRequest,
) (*workflowservice.GetSystemInfoResponse, error) {
	authorization := metadata.ValueFromIncomingContext(ctx, "grpcgateway-authorization")
	if len(authorization) != 1 || authorization[0] != "Bearer valid-token" {
		return nil, status.Error(codes.Unauthenticated, "invalid token")
	}
	return &workflowservice.GetSystemInfoResponse{}, nil
}

func newAccessCheckConnection(t *testing.T) *grpc.ClientConn {
	t.Helper()
	listener := bufconn.Listen(1024 * 1024)
	server := grpc.NewServer()
	workflowservice.RegisterWorkflowServiceServer(server, &accessCheckWorkflowService{})
	go func() {
		_ = server.Serve(listener)
	}()
	t.Cleanup(func() {
		server.Stop()
		_ = listener.Close()
	})

	conn, err := grpc.NewClient(
		"passthrough:///bufnet",
		grpc.WithContextDialer(func(context.Context, string) (net.Conn, error) {
			return listener.Dial()
		}),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })
	return conn
}

func (m *mockConfigProvider) GetConfig() (*config.Config, error) {
	return m.cfg, nil
}

func TestTemporalAccessCheckUsesTemporalAPIAuthority(t *testing.T) {
	check := TemporalAccessCheck(newAccessCheckConnection(t), nil)
	e := echo.New()

	for _, test := range []struct {
		name       string
		token      string
		statusCode int
	}{
		{name: "accepted", token: "Bearer valid-token", statusCode: http.StatusOK},
		{name: "rejected", token: "Bearer forged-token", statusCode: http.StatusUnauthorized},
	} {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v1/ui-extensions", nil)
			req.Header.Set(echo.HeaderAuthorization, test.token)
			c := e.NewContext(req, httptest.NewRecorder())

			err := check(c)
			if test.statusCode == http.StatusOK {
				require.NoError(t, err)
				return
			}

			var httpErr *echo.HTTPError
			require.ErrorAs(t, err, &httpErr)
			assert.Equal(t, test.statusCode, httpErr.Code)
		})
	}
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

func TestGetSettingsOnlyIncludesCustomUIEnabledState(t *testing.T) {
	cfg := &config.Config{}
	cfg.CustomUI.Enabled = true
	cfg.CustomUI.IframeExtensions = []config.IframeExtension{
		{
			ID:            "incident-panel",
			Title:         "Incident Panel",
			Slot:          "workflow.header.after-details",
			Src:           "/extension.html",
			AllowedOrigin: "self",
			RoutePatterns: []string{
				"/namespaces/:namespace/workflows/:workflow/:run/*",
			},
			Sandbox: config.IframeSandbox{
				AllowPopups: true,
			},
			Sizing: config.IframeExtensionSizing{
				DefaultHeight: 160,
				MaxHeight:     480,
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

	var payload map[string]any
	err = json.Unmarshal(rec.Body.Bytes(), &payload)
	require.NoError(t, err)
	customUI, ok := payload["CustomUI"].(map[string]any)
	require.True(t, ok)
	assert.Equal(t, true, customUI["Enabled"])
	assert.NotContains(t, customUI, "IframeExtensions")

	var settings SettingsResponse
	err = json.Unmarshal(rec.Body.Bytes(), &settings)
	require.NoError(t, err)

	require.NotNil(t, settings.CustomUI)
	assert.True(t, settings.CustomUI.Enabled)
}

func TestGetUIExtensionsReturnsRegistryWhenAuthDisabled(t *testing.T) {
	cfg := &config.Config{}
	cfg.CustomUI.Enabled = true
	cfg.CustomUI.IframeExtensions = []config.IframeExtension{
		{
			ID:            "incident-panel",
			Title:         "Incident Panel",
			Slot:          "workflow.header.after-details",
			Src:           "https://extensions.example.com/workflow-header.html",
			AllowedOrigin: "https://extensions.example.com",
			RoutePatterns: []string{
				"/namespaces/:namespace/workflows/:workflow/:run/*",
			},
			Sandbox: config.IframeSandbox{
				AllowPopups:     true,
				AllowSameOrigin: true,
			},
			Sizing: config.IframeExtensionSizing{
				DefaultHeight: 160,
				MaxHeight:     480,
			},
			Permissions: []string{"context:workflow"},
		},
	}

	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/ui-extensions", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err = GetUIExtensions(cfgProvider, nil)(c)
	require.NoError(t, err)

	var extensions CustomUIResponse
	err = json.Unmarshal(rec.Body.Bytes(), &extensions)
	require.NoError(t, err)

	assert.True(t, extensions.Enabled)
	require.Len(t, extensions.IframeExtensions, 1)

	extension := extensions.IframeExtensions[0]
	assert.Equal(t, "incident-panel", extension.ID)
	assert.Equal(t, "workflow.header.after-details", extension.Slot)
	assert.Equal(t, "https://extensions.example.com", extension.AllowedOrigin)
	assert.True(t, extension.Sandbox.AllowPopups)
	assert.True(t, extension.Sandbox.AllowSameOrigin)
	assert.Equal(t, 160, extension.Sizing.DefaultHeight)
	assert.Equal(t, 480, extension.Sizing.MaxHeight)
	assert.Contains(t, extension.Permissions, "context:workflow")
}

func TestGetUIExtensionsDisabledOmitsDefinitions(t *testing.T) {
	cfg := &config.Config{
		CustomUI: config.CustomUI{
			Enabled: false,
			IframeExtensions: []config.IframeExtension{
				{ID: "disabled", Slot: "unknown", Src: "javascript:alert(1)", AllowedOrigin: "*"},
			},
		},
	}
	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/ui-extensions", nil)
	rec := httptest.NewRecorder()
	err = GetUIExtensions(cfgProvider, nil)(e.NewContext(req, rec))
	require.NoError(t, err)

	var response CustomUIResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &response))
	assert.False(t, response.Enabled)
	assert.Empty(t, response.IframeExtensions)
}

func TestGetUIExtensionsRequiresAuthorizationWhenAuthEnabled(t *testing.T) {
	cfg := &config.Config{}
	cfg.Auth.Enabled = true
	cfg.CustomUI.Enabled = true
	cfg.CustomUI.IframeExtensions = []config.IframeExtension{
		{
			ID:            "authenticated-panel",
			Slot:          "workflow.header.after-details",
			Src:           "https://extensions.example.com/panel.html",
			AllowedOrigin: "https://extensions.example.com",
		},
	}

	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/ui-extensions", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	accessChecked := false
	allowAccess := func(echo.Context) error {
		accessChecked = true
		return nil
	}
	err = GetUIExtensions(cfgProvider, allowAccess)(c)
	var httpErr *echo.HTTPError
	require.ErrorAs(t, err, &httpErr)
	assert.Equal(t, http.StatusUnauthorized, httpErr.Code)
	assert.False(t, accessChecked)
	assert.Equal(t, "no-store", rec.Header().Get("Cache-Control"))
	assert.Equal(t, echo.HeaderAuthorization, rec.Header().Get("Vary"))

	req = httptest.NewRequest(http.MethodGet, "/api/v1/ui-extensions", nil)
	req.Header.Set(echo.HeaderAuthorization, "Bearer test-token")
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)

	err = GetUIExtensions(cfgProvider, func(echo.Context) error {
		return echo.NewHTTPError(http.StatusForbidden, "unauthorized")
	})(c)
	require.ErrorAs(t, err, &httpErr)
	assert.Equal(t, http.StatusForbidden, httpErr.Code)
	assert.Empty(t, rec.Body.String())

	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	err = GetUIExtensions(cfgProvider, allowAccess)(c)
	require.NoError(t, err)
	assert.True(t, accessChecked)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "no-store", rec.Header().Get("Cache-Control"))
	assert.Equal(t, echo.HeaderAuthorization, rec.Header().Get("Vary"))

	var extensions CustomUIResponse
	err = json.Unmarshal(rec.Body.Bytes(), &extensions)
	require.NoError(t, err)
	require.Len(t, extensions.IframeExtensions, 1)
	assert.Equal(t, "authenticated-panel", extensions.IframeExtensions[0].ID)
}

func TestGetUIExtensionsRejectsInvalidRuntimeConfiguration(t *testing.T) {
	cfg := &config.Config{}
	cfg.CustomUI.Enabled = true
	cfg.CustomUI.IframeExtensions = []config.IframeExtension{
		{
			ID:            "invalid",
			Slot:          "unknown.slot",
			Src:           "/extension.html",
			AllowedOrigin: "self",
		},
	}

	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/ui-extensions", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err = GetUIExtensions(cfgProvider, nil)(c)
	var httpErr *echo.HTTPError
	require.ErrorAs(t, err, &httpErr)
	assert.Equal(t, http.StatusInternalServerError, httpErr.Code)
}
