package route

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func newEchoWithPublicPath(prefix string) *echo.Echo {
	e := echo.New()
	e.Pre(PublicPath(prefix))
	e.GET("/*", func(c echo.Context) error {
		return c.String(http.StatusOK, c.Request().URL.Path)
	})
	return e
}

func TestPublicPath_StripsPrefixAtStart(t *testing.T) {
	tests := []struct {
		name     string
		prefix   string
		request  string
		expected string
	}{
		{
			name:     "single segment prefix",
			prefix:   "/custom",
			request:  "/custom/namespaces",
			expected: "/namespaces",
		},
		{
			name:     "trailing slash only",
			prefix:   "/custom",
			request:  "/custom/",
			expected: "/",
		},
		{
			name:     "deep path",
			prefix:   "/custom",
			request:  "/custom/namespaces/default/workflows",
			expected: "/namespaces/default/workflows",
		},
		{
			name:     "multi-segment prefix",
			prefix:   "/foo/bar",
			request:  "/foo/bar/baz",
			expected: "/baz",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := newEchoWithPublicPath(tt.prefix)
			req := httptest.NewRequest(http.MethodGet, tt.request, nil)
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, tt.expected, rec.Body.String())
		})
	}
}

// Regression: echo's default Rewrite("/custom/*", "/$1") compiles to a
// regex that is end-anchored but NOT start-anchored, so it matches the
// prefix anywhere in the URL. Build a start-anchored regex explicitly so
// embedded substrings are left alone.
func TestPublicPath_DoesNotRewriteEmbeddedPrefix(t *testing.T) {
	tests := []struct {
		name    string
		prefix  string
		request string
	}{
		{
			name:    "prefix as middle segment",
			prefix:  "/custom",
			request: "/foo/custom/bar",
		},
		{
			name:    "asset path containing prefix substring",
			prefix:  "/custom",
			request: "/_app/immutable/chunks/custom/abc.js",
		},
		{
			name:    "completely unrelated path",
			prefix:  "/custom",
			request: "/namespaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := newEchoWithPublicPath(tt.prefix)
			req := httptest.NewRequest(http.MethodGet, tt.request, nil)
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, tt.request, rec.Body.String(), "URL.Path should be unmodified")
		})
	}
}

func TestPublicPath_DoesNotMatchPrefixWithoutSeparator(t *testing.T) {
	// /customfoo shares the literal prefix string but isn't a sub-path.
	// The middleware should not rewrite it.
	e := newEchoWithPublicPath("/custom")
	req := httptest.NewRequest(http.MethodGet, "/customfoo", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "/customfoo", rec.Body.String())
}

func TestPublicPath_EmptyPrefix_IsNoop(t *testing.T) {
	e := newEchoWithPublicPath("")
	for _, p := range []string{"/", "/namespaces", "/namespaces/default/workflows"} {
		req := httptest.NewRequest(http.MethodGet, p, nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, p, rec.Body.String(), "empty prefix must not rewrite path %q", p)
	}
}

func TestPublicPath_QuotesRegexMetacharacters(t *testing.T) {
	e := newEchoWithPublicPath("/foo.bar")

	// The "." must not act as a wildcard — "/fooXbar/baz" should not be rewritten.
	req := httptest.NewRequest(http.MethodGet, "/fooXbar/baz", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "/fooXbar/baz", rec.Body.String(), "metacharacter in prefix must not match unrelated path")

	// The literal prefix should still be stripped correctly.
	req = httptest.NewRequest(http.MethodGet, "/foo.bar/baz", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "/baz", rec.Body.String())
}
