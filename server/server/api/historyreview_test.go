package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/historyreview"
	"github.com/temporalio/ui-server/v2/server/ratelimit"
)

// fakeScoreJev answers each Score question with the position 0.6 (0.2 after
// normalisation). failCall makes the call with that number (from 1) fail.
func fakeScoreJev(t *testing.T, calls *atomic.Int32, failCall int32, delay time.Duration) *httptest.Server {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		number := calls.Add(1)
		assert.Equal(t, "Bearer "+nlSearchTestAPIKey, r.Header.Get("Authorization"))
		if delay > 0 {
			select {
			case <-time.After(delay):
			case <-r.Context().Done():
				return
			}
		}
		if number == failCall {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		var req struct {
			Questions map[string]json.RawMessage `json:"questions"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			// The reviewer cancels the other requests when one fails: the body can end early.
			return
		}

		answers := map[string]any{}
		for id := range req.Questions {
			answers[id] = map[string]any{"type": "score", "score": 0.6, "confidence": 0.9}
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"model": "jev-test", "answers": answers})
	}))
	t.Cleanup(srv.Close)
	return srv
}

type historyItem = historyreview.Item

// historyBody builds a request with n rows of n distinct signatures, and one failed row that is pinned.
func historyBody(namespace string, distinct int) string {
	items := []historyItem{}
	for i := 0; i < distinct; i++ {
		items = append(items, historyItem{ID: fmt.Sprintf("g%d", i), Kind: "group", Category: "activity", Name: fmt.Sprintf("Activity%04d", i), Classification: "Completed", EventCount: 3, Attempt: 1})
	}
	items = append(items, historyItem{ID: "last", Kind: "event", Category: "workflow", Name: "WorkflowExecutionFailed", Classification: "Failed"})

	body, _ := json.Marshal(map[string]any{
		"namespace": namespace, "workflowType": "OrderWorkflow", "workflowStatus": "Failed", "items": items,
	})
	return string(body)
}

type historyReviewHarness struct {
	t        *testing.T
	cfg      *config.Config
	frontend *fakeFrontend
	calls    *atomic.Int32
	gate     *TypeSafeGate
	echo     *echo.Echo
}

func newHistoryReviewHarness(t *testing.T, failCall int32, mutate func(cfg *config.Config)) *historyReviewHarness {
	t.Helper()

	h := &historyReviewHarness{t: t, calls: &atomic.Int32{}, echo: echo.New(), frontend: &fakeFrontend{requireAuth: true}}
	upstream := fakeScoreJev(t, h.calls, failCall, 0)

	h.cfg = typeSafeTestConfig(upstream.URL)
	if mutate != nil {
		mutate(h.cfg)
	}
	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: h.cfg})
	require.NoError(t, err)
	t.Cleanup(cfgProvider.Close)

	h.gate = NewTypeSafeGate(cfgProvider, []Middleware{forwardExtras}, newFakeFrontendConn(t, h.frontend), ratelimit.New(ratelimit.Options{}))
	return h
}

func (h *historyReviewHarness) post(handler echo.HandlerFunc, path, authHeader, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.RemoteAddr = "192.0.2.1:1001"
	if authHeader != "" {
		req.Header.Set(echo.HeaderAuthorization, authHeader)
	}
	rec := httptest.NewRecorder()
	require.NoError(h.t, handler(h.echo.NewContext(req, rec)), "the handler writes each error in its own format")
	return rec
}

func (h *historyReviewHarness) review(authHeader, body string) *httptest.ResponseRecorder {
	return h.post(HistoryReviewHandler(h.gate), "/api/v1/history-review", authHeader, body)
}

func errorMessage(t *testing.T, rec *httptest.ResponseRecorder) string {
	t.Helper()
	var body TypeSafeErrorResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body), rec.Body.String())
	require.NotEmpty(t, body.Message)
	return body.Message
}

func TestHistoryReviewHandler(t *testing.T) {
	h := newHistoryReviewHarness(t, 0, nil)

	rec := h.review(goodToken, historyBody("orders-prod", 3))
	require.Equal(t, http.StatusOK, rec.Code, rec.Body.String())

	var result historyreview.Result
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &result))
	assert.Equal(t, "jev-test", result.Model)
	assert.Equal(t, map[string]historyreview.Score{
		"g0":   {Score: 0.2, Confidence: 0.9},
		"g1":   {Score: 0.2, Confidence: 0.9},
		"g2":   {Score: 0.2, Confidence: 0.9},
		"last": {Score: 1, Confidence: 1, Pinned: true},
	}, result.Scores)
	assert.Contains(t, rec.Body.String(), `"g0":{"score":0.2,"confidence":0.9,"pinned":false}`)

	assert.Equal(t, []string{"orders-prod"}, h.frontend.calls)
	assert.Equal(t, []string{goodToken}, h.frontend.metadata[0].Get("authorization"), "the credentials of the caller go to the frontend")
	assert.Equal(t, int32(1), h.calls.Load())
	assert.NotContains(t, rec.Body.String(), nlSearchTestAPIKey)
}

// The gate order is the same as for nl-search: a request that the server rejects never reaches the paid API.
func TestHistoryReviewGateOrder(t *testing.T) {
	valid := historyBody("orders-prod", 3)

	tests := []struct {
		name            string
		authEnabled     bool
		authHeader      string
		body            string
		wantStatus      int
		wantFrontend    bool
		wantMessagePart string
	}{
		{name: "auth enabled without a header", authEnabled: true, body: valid, wantStatus: http.StatusUnauthorized, wantMessagePart: "unauthorized"},
		{name: "the frontend rejects an invented token", authEnabled: true, authHeader: "Bearer x", body: valid, wantStatus: http.StatusUnauthorized, wantFrontend: true, wantMessagePart: "unauthorized"},
		{name: "the frontend denies access to the namespace", authEnabled: true, authHeader: readOnlyToken, body: valid, wantStatus: http.StatusForbidden, wantFrontend: true, wantMessagePart: "orders-prod"},
		{name: "the frontend authorizes also when ui-server auth is off", body: valid, wantStatus: http.StatusUnauthorized, wantFrontend: true, wantMessagePart: "unauthorized"},
		{name: "namespace not found", authHeader: goodToken, body: historyBody("no-such-namespace", 3), wantStatus: http.StatusBadRequest, wantFrontend: true, wantMessagePart: "was not found"},
		{name: "frontend failure", authHeader: goodToken, body: historyBody("frontend-down", 3), wantStatus: http.StatusBadGateway, wantFrontend: true, wantMessagePart: "unable to verify access"},
		{name: "missing namespace", authHeader: goodToken, body: historyBody("", 3), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace is required"},
		{name: "namespace with a path traversal", authHeader: goodToken, body: historyBody("a/../b", 3), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "malformed JSON", authHeader: goodToken, body: `{"items": `, wantStatus: http.StatusBadRequest, wantMessagePart: "invalid request body"},
		{name: "no items", authHeader: goodToken, body: `{"namespace": "orders-prod", "items": []}`, wantStatus: http.StatusBadRequest, wantMessagePart: "items must have one entry or more"},
		{name: "too many items", authHeader: goodToken, body: historyBody("orders-prod", historyreview.MaxItems), wantStatus: http.StatusBadRequest, wantMessagePart: "items must have 1000 entries or fewer"},
		{name: "too many distinct kinds of row", authHeader: goodToken, body: historyBody("orders-prod", historyreview.MaxDistinctSignatures), wantStatus: http.StatusBadRequest, wantMessagePart: "send fewer items in one call"},
		{name: "a name with a control character", authHeader: goodToken, body: strings.Replace(valid, "Activity0001", `Activity\u0007`, 1), wantStatus: http.StatusBadRequest, wantMessagePart: "items[1].name has a control character"},
		{name: "an unknown category", authHeader: goodToken, body: strings.Replace(valid, `"category":"activity"`, `"category":"payload"`, 1), wantStatus: http.StatusBadRequest, wantMessagePart: "items[0].category"},
		{name: "body over the size limit", authHeader: goodToken, body: `{"namespace": "orders-prod", "padding": "` + strings.Repeat("p", maxHistoryReviewBodyBytes) + `"}`, wantStatus: http.StatusBadRequest, wantMessagePart: "invalid request body"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newHistoryReviewHarness(t, 0, func(cfg *config.Config) { cfg.Auth.Enabled = tt.authEnabled })

			rec := h.review(tt.authHeader, tt.body)
			assert.Equal(t, tt.wantStatus, rec.Code)
			assert.Contains(t, errorMessage(t, rec), tt.wantMessagePart)
			assert.Equal(t, tt.wantFrontend, h.frontend.callCount() > 0, "frontend calls")
			assert.Zero(t, h.calls.Load(), "a request that the server rejects must not reach the paid API")
		})
	}
}

// Each feature has its own gate: one feature on does not open the endpoint of the other.
func TestTypeSafeFeatureGatesAreIndependent(t *testing.T) {
	tests := map[string]struct {
		nlSearch, historyReview bool
	}{
		"only nl-search":      {nlSearch: true},
		"only history review": {historyReview: true},
		"both":                {nlSearch: true, historyReview: true},
		"none":                {},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			h := newHistoryReviewHarness(t, 0, func(cfg *config.Config) {
				cfg.NLSearch.Enabled, cfg.HistoryReview.Enabled = tt.nlSearch, tt.historyReview
			})
			status := func(on bool) int {
				if on {
					return http.StatusOK
				}
				return http.StatusNotFound
			}

			rec := h.review(goodToken, historyBody("orders-prod", 3))
			assert.Equal(t, status(tt.historyReview), rec.Code)
			if !tt.historyReview {
				assert.Equal(t, "history review is not enabled", errorMessage(t, rec))
			}

			rec = h.post(NLSearchHandler(h.gate), "/api/v1/nl-search", goodToken, nlSearchValidBody)
			assert.Equal(t, status(tt.nlSearch), rec.Code)
			if !tt.nlSearch {
				assert.Equal(t, "natural-language search is not enabled", errorMessage(t, rec))
			}
		})
	}
}

// The cost of a review is the number of TypeSafe requests. The handler charges all of
// it before the first paid call.
func TestHistoryReviewChargesTheNumberOfRequests(t *testing.T) {
	h := newHistoryReviewHarness(t, 0, func(cfg *config.Config) {
		cfg.TypeSafe.RateLimit = config.TypeSafeRateLimit{RequestsPerMinute: 1, Burst: 5}
	})

	// 120 distinct signatures are 3 TypeSafe requests: 3 of the 5 tokens.
	rec := h.review(goodToken, historyBody("orders-prod", 120))
	require.Equal(t, http.StatusOK, rec.Code, rec.Body.String())
	assert.Equal(t, int32(3), h.calls.Load())

	var result historyreview.Result
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &result))
	assert.Len(t, result.Scores, 121)

	// A second review of the same size needs 3 tokens, and 2 are left: 429 before each paid call.
	// The gate took 1 token for this request, so 1 is left.
	rec = h.review(goodToken, historyBody("orders-prod", 120))
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, "60", rec.Header().Get(echo.HeaderRetryAfter))
	assert.Contains(t, errorMessage(t, rec), "too many requests")
	assert.Equal(t, int32(3), h.calls.Load(), "a limited review makes no paid call")

	// The last token pays for a review of 1 request. After that, the bucket is empty: 3 + 1 + 1 = 5.
	rec = h.review(goodToken, historyBody("orders-prod", 10))
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, int32(4), h.calls.Load())

	rec = h.review(goodToken, historyBody("orders-prod", 10))
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, int32(4), h.calls.Load())

	// The two endpoints share the deployment bucket. Their caller buckets are apart.
	rec = h.post(NLSearchHandler(h.gate), "/api/v1/nl-search", goodToken, nlSearchValidBody)
	assert.Equal(t, http.StatusOK, rec.Code, "the nl-search caller bucket is a different bucket")
}

// A review that needs more requests than the burst can never pass. The answer is a
// clear 400, not a 429 that tells the client to try again for ever.
func TestHistoryReviewTooLargeForTheRateLimit(t *testing.T) {
	h := newHistoryReviewHarness(t, 0, func(cfg *config.Config) {
		cfg.TypeSafe.RateLimit = config.TypeSafeRateLimit{RequestsPerMinute: 30, Burst: 2}
	})

	rec := h.review(goodToken, historyBody("orders-prod", 120))
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Equal(t, historyTooLargeMessage, errorMessage(t, rec))
	assert.Empty(t, rec.Header().Get(echo.HeaderRetryAfter))
	assert.Zero(t, h.frontend.callCount(), "the cost is known after validation: no gRPC round trip")
	assert.Zero(t, h.calls.Load())

	// A review of 2 requests is equal to the burst. The gate took 1 token for the request above.
	rec = h.review(goodToken, historyBody("orders-prod", 100))
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)

	t.Run("a disabled limit permits each size", func(t *testing.T) {
		h := newHistoryReviewHarness(t, 0, func(cfg *config.Config) {
			cfg.TypeSafe.RateLimit = config.TypeSafeRateLimit{Disabled: true, Burst: 2}
		})
		rec := h.review(goodToken, historyBody("orders-prod", historyreview.MaxDistinctSignatures-1))
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, int32(historyreview.MaxRequests), h.calls.Load())
	})
}

func TestHistoryReviewAllRowsPinnedMakesNoPaidCall(t *testing.T) {
	h := newHistoryReviewHarness(t, 0, nil)

	rec := h.review(goodToken, historyBody("orders-prod", 0))
	require.Equal(t, http.StatusOK, rec.Code)
	assert.Zero(t, h.calls.Load())
	assert.JSONEq(t, `{"scores": {"last": {"score": 1, "confidence": 1, "pinned": true}}, "model": "jev-latest"}`, rec.Body.String(), "no call took place: the configured model")
}

// One failed TypeSafe request fails the review. The response has no partial scores.
func TestHistoryReviewPartialFailure(t *testing.T) {
	h := newHistoryReviewHarness(t, 2, nil)

	rec := h.review(goodToken, historyBody("orders-prod", 120))
	assert.Equal(t, http.StatusBadGateway, rec.Code)
	assert.Equal(t, "history review is not available", errorMessage(t, rec))
	assert.NotContains(t, rec.Body.String(), "scores")
}

// One review has one deadline. A TypeSafe server that is too slow gives 504, in about
// the time of the deadline, and the response has no partial scores.
func TestHistoryReviewDeadline(t *testing.T) {
	calls := &atomic.Int32{}
	upstream := fakeScoreJev(t, calls, 0, 3*time.Second)

	cfg := typeSafeTestConfig(upstream.URL)
	cfg.TypeSafe.Timeout = 150 * time.Millisecond
	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	h := &historyReviewHarness{t: t, calls: calls, echo: echo.New(), frontend: &fakeFrontend{requireAuth: true}}
	h.gate = NewTypeSafeGate(cfgProvider, nil, newFakeFrontendConn(t, h.frontend), ratelimit.New(ratelimit.Options{}))

	start := time.Now()
	rec := h.review(goodToken, historyBody("orders-prod", 120))
	elapsed := time.Since(start)

	assert.Equal(t, http.StatusGatewayTimeout, rec.Code)
	assert.Equal(t, "history review timed out", errorMessage(t, rec))
	assert.NotContains(t, rec.Body.String(), "scores")
	assert.Less(t, elapsed, 2*time.Second, "the deadline is 1 wave of 150ms, not the 3s of the slow server")
	assert.Equal(t, int32(3), calls.Load(), "the 3 requests of the wave started")
}
