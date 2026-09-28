package route

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/temporalio/ui-server/v2/server/config"
)

type staticConfigProvider struct {
	cfg *config.Config
}

func (p *staticConfigProvider) GetConfig() (*config.Config, error) {
	return p.cfg, nil
}

// The nl-search route must win over the "/*" catch-all, and DisableWriteMiddleware
// must not block it, because it is a read operation.
func TestTypeSafeRoutesAreNotBlockedByDisableWriteActions(t *testing.T) {
	var upstreamCalls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upstreamCalls.Add(1)
		_, _ = io.WriteString(w, `{"model": "jev-test", "answers": {}}`)
	}))
	defer upstream.Close()

	cfg := &config.Config{
		TemporalGRPCAddress: "127.0.0.1:7233",
		DisableWriteActions: true,
		TypeSafe:            config.TypeSafe{APIKey: "test-key", BaseURL: upstream.URL},
		NLSearch:            config.NLSearch{Enabled: true},
		HistoryReview:       config.HistoryReview{Enabled: true},
	}
	cfgProvider, err := config.NewConfigProviderWithRefresh(&staticConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	require.NoError(t, SetAPIRoutes(e, cfgProvider, nil))

	post := func(path, body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		return rec
	}

	// A request without a namespace gets the validation error of the nl-search handler.
	// That proves that the route wins over the catch-all and that the write control
	// does not return 405. The handler makes no gRPC call and no TypeSafe call for it.
	rec := post("/api/v1/nl-search", `{"text": "failed workflows", "now": "2026-09-20T15:04:05Z"}`)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.JSONEq(t, `{"message": "namespace is required"}`, rec.Body.String())
	assert.Zero(t, upstreamCalls.Load())

	// Only POST belongs to the nl-search handler. A GET falls through to the catch-all:
	// the gateway knows no such path and answers 404 in its own format, with no gRPC
	// call. Without the fall-through, Echo answers 405 for a path that has only a POST route.
	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/nl-search", nil)
	getRec := httptest.NewRecorder()
	e.ServeHTTP(getRec, getReq)
	assert.Equal(t, http.StatusNotFound, getRec.Code)
	assert.Contains(t, getRec.Body.String(), `"code"`, "the body comes from the gateway of the catch-all")
	assert.NotContains(t, getRec.Body.String(), "natural-language")

	// A write through the catch-all stays blocked.
	rec = post("/api/v1/namespaces/default/workflows/some-id/terminate", `{}`)
	assert.Equal(t, http.StatusMethodNotAllowed, rec.Code)

	// The history review route has the same properties.
	rec = post("/api/v1/history-review", `{"items": [{"id": "1", "kind": "event", "category": "workflow", "name": "WorkflowExecutionStarted"}]}`)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.JSONEq(t, `{"message": "namespace is required"}`, rec.Body.String())
	assert.Zero(t, upstreamCalls.Load())

	getReq = httptest.NewRequest(http.MethodGet, "/api/v1/history-review", nil)
	getRec = httptest.NewRecorder()
	e.ServeHTTP(getRec, getReq)
	assert.Equal(t, http.StatusNotFound, getRec.Code)
	assert.Contains(t, getRec.Body.String(), `"code"`)

	// Each feature has its own gate.
	cfg.NLSearch.Enabled = false
	rec = post("/api/v1/nl-search", `{"text": "failed workflows", "now": "2026-09-20T15:04:05Z"}`)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	rec = post("/api/v1/history-review", `{"items": []}`)
	assert.Equal(t, http.StatusBadRequest, rec.Code, "history review stays on")

	cfg.NLSearch.Enabled, cfg.HistoryReview.Enabled = true, false
	rec = post("/api/v1/history-review", `{"items": []}`)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	rec = post("/api/v1/nl-search", `{"text": "failed workflows", "now": "2026-09-20T15:04:05Z"}`)
	assert.Equal(t, http.StatusBadRequest, rec.Code, "nl-search stays on")
}
