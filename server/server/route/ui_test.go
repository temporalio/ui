package route

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

var testIndexHTML = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-security-policy" content="default-src 'self'">
<script>
__sveltekit_12oxofr = {
	base: ""
};
</script>
<link rel="stylesheet" href="/_app/style.css">
</head>
<body></body>
</html>`

func newTestAssets(html string) fstest.MapFS {
	return fstest.MapFS{
		"index.html": &fstest.MapFile{Data: []byte(html)},
	}
}

func TestBuildUIIndexHandler_NoPublicPath(t *testing.T) {
	handler, err := buildUIIndexHandler("", newTestAssets(testIndexHTML))
	assert.NoError(t, err)

	tests := []struct {
		name string
		path string
	}{
		{
			name: "root path serves index",
			path: "/",
		},
		{
			name: "sub page serves index",
			path: "/namespaces",
		},
		{
			name: "deep path serves index",
			path: "/namespaces/default/workflows",
		},
		{
			name: "path with query serves index",
			path: "/namespaces?ns=default",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, tt.path, nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := handler(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)

			body := rec.Body.String()
			assert.Contains(t, body, `base: ""`)
			assert.Contains(t, body, `"/_app/style.css"`)
			assert.Contains(t, body, "content-security-policy")
		})
	}
}

func TestBuildUIIndexHandler_WithPublicPath_RewritesBaseAndAssets(t *testing.T) {
	handler, err := buildUIIndexHandler("/temporal", newTestAssets(testIndexHTML))
	assert.NoError(t, err)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/temporal/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err = handler(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)

	body := rec.Body.String()
	assert.Contains(t, body, `base: "/temporal"`)
	assert.Contains(t, body, `"/temporal/_app/style.css"`)
	assert.NotContains(t, body, "content-security-policy")
}

func TestBuildUIIndexHandler_WithPublicPath_RedirectsWhenPrefixMissing(t *testing.T) {
	handler, err := buildUIIndexHandler("/temporal", newTestAssets(testIndexHTML))
	assert.NoError(t, err)

	tests := []struct {
		name           string
		requestURI     string
		path           string
		query          string
		expectedTarget string
	}{
		{
			name:           "root path redirects to public path",
			requestURI:     "/",
			path:           "/",
			expectedTarget: "/temporal/",
		},
		{
			name:           "sub page redirects with prefix",
			requestURI:     "/namespaces",
			path:           "/namespaces",
			expectedTarget: "/temporal/namespaces",
		},
		{
			name:           "sub page preserves query params",
			requestURI:     "/namespaces?ns=default",
			path:           "/namespaces",
			query:          "ns=default",
			expectedTarget: "/temporal/namespaces?ns=default",
		},
		{
			name:           "deep path redirects with prefix",
			requestURI:     "/namespaces/default/workflows",
			path:           "/namespaces/default/workflows",
			expectedTarget: "/temporal/namespaces/default/workflows",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			target := tt.path
			if tt.query != "" {
				target += "?" + tt.query
			}
			req := httptest.NewRequest(http.MethodGet, target, nil)
			req.RequestURI = tt.requestURI
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := handler(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusPermanentRedirect, rec.Code)
			assert.Equal(t, tt.expectedTarget, rec.Header().Get("Location"))
		})
	}
}

func TestBuildUIIndexHandler_WithPublicPath_ServesWhenPrefixPresent(t *testing.T) {
	handler, err := buildUIIndexHandler("/temporal", newTestAssets(testIndexHTML))
	assert.NoError(t, err)

	tests := []struct {
		name       string
		requestURI string
		path       string
	}{
		{
			name:       "prefixed root",
			requestURI: "/temporal/",
			path:       "/",
		},
		{
			name:       "prefixed sub page",
			requestURI: "/temporal/namespaces",
			path:       "/namespaces",
		},
		{
			name:       "prefixed with query",
			requestURI: "/temporal/namespaces?ns=default",
			path:       "/namespaces",
		},
		{
			name:       "exact public path",
			requestURI: "/temporal",
			path:       "/temporal",
		},
		{
			name:       "exact public path with query",
			requestURI: "/temporal?q=1",
			path:       "/temporal",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, tt.path, nil)
			req.RequestURI = tt.requestURI
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := handler(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Contains(t, rec.Body.String(), `base: "/temporal"`)
		})
	}
}

func TestBuildUIIndexHandler_MissingIndexHTML(t *testing.T) {
	emptyFS := fstest.MapFS{}
	_, err := buildUIIndexHandler("", emptyFS)
	assert.Error(t, err)
}
