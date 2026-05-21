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
		target         string
		expectedTarget string
	}{
		{
			name:           "root path redirects to public path",
			target:         "/",
			expectedTarget: "/temporal/",
		},
		{
			name:           "sub page redirects with prefix",
			target:         "/namespaces",
			expectedTarget: "/temporal/namespaces",
		},
		{
			name:           "sub page preserves query params",
			target:         "/namespaces?ns=default",
			expectedTarget: "/temporal/namespaces?ns=default",
		},
		{
			name:           "deep path redirects with prefix",
			target:         "/namespaces/default/workflows",
			expectedTarget: "/temporal/namespaces/default/workflows",
		},
		{
			name:           "path sharing prefix string but not a sub-path",
			target:         "/temporalfoo",
			expectedTarget: "/temporal/temporalfoo",
		},
		{
			name:           "path sharing prefix string with query preserves both",
			target:         "/temporalfoo?x=1",
			expectedTarget: "/temporal/temporalfoo?x=1",
		},
		{
			name:           "trailing slash is normalized away by path.Clean",
			target:         "/namespaces/",
			expectedTarget: "/temporal/namespaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, tt.target, nil)
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
		name   string
		target string
	}{
		{
			name:   "prefixed root",
			target: "/temporal/",
		},
		{
			name:   "prefixed sub page",
			target: "/temporal/namespaces",
		},
		{
			name:   "prefixed with query",
			target: "/temporal/namespaces?ns=default",
		},
		{
			name:   "exact public path",
			target: "/temporal",
		},
		{
			name:   "exact public path with query",
			target: "/temporal?q=1",
		},
		{
			name:   "already-prefixed path is not re-prefixed",
			target: "/temporal/temporal/namespaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, tt.target, nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := handler(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Contains(t, rec.Body.String(), `base: "/temporal"`)
		})
	}
}

// The PublicPath middleware rewrites URL.Path to strip the prefix before
// reaching this handler, while leaving RequestURI intact. The handler must
// not redirect in that case, otherwise the rewrite + redirect loops.
func TestBuildUIIndexHandler_WithPublicPath_HandlesMiddlewareRewrittenPath(t *testing.T) {
	handler, err := buildUIIndexHandler("/temporal", newTestAssets(testIndexHTML))
	assert.NoError(t, err)

	tests := []struct {
		name       string
		requestURI string
		urlPath    string
	}{
		{
			name:       "prefixed sub page rewritten by middleware",
			requestURI: "/temporal/namespaces",
			urlPath:    "/namespaces",
		},
		{
			name:       "prefixed root rewritten by middleware",
			requestURI: "/temporal/",
			urlPath:    "/",
		},
		{
			name:       "prefixed with query rewritten by middleware",
			requestURI: "/temporal/namespaces?ns=default",
			urlPath:    "/namespaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, tt.urlPath, nil)
			req.RequestURI = tt.requestURI
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := handler(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code, "handler should serve index, not redirect")
			assert.Contains(t, rec.Body.String(), `base: "/temporal"`)
		})
	}
}

func TestBuildUIIndexHandler_MissingIndexHTML(t *testing.T) {
	emptyFS := fstest.MapFS{}
	_, err := buildUIIndexHandler("", emptyFS)
	assert.Error(t, err)
}
