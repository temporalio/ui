package api

import (
	"context"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.temporal.io/api/workflowservice/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/test/bufconn"

	"github.com/temporalio/ui-server/v2/server/config"
	"github.com/temporalio/ui-server/v2/server/nlsearch"
	"github.com/temporalio/ui-server/v2/server/ratelimit"
)

const (
	goodToken     = "Bearer good-token"
	readOnlyToken = "Bearer other-team-token"
	extrasHeader  = "Authorization-Extras"

	// literalNamespace has each punctuation character that a namespace name can have.
	literalNamespace = "orders_prod.v2-eu"
)

// fakeFrontend is a Temporal frontend with an authorizer. It accepts goodToken for
// the namespace "orders-prod", and it records the metadata of each call.
type fakeFrontend struct {
	workflowservice.UnimplementedWorkflowServiceServer

	mu       sync.Mutex
	calls    []string
	metadata []metadata.MD
	// requireAuth is false for a frontend with no authorizer.
	requireAuth bool
}

func (f *fakeFrontend) DescribeNamespace(ctx context.Context, req *workflowservice.DescribeNamespaceRequest) (*workflowservice.DescribeNamespaceResponse, error) {
	md, _ := metadata.FromIncomingContext(ctx)

	f.mu.Lock()
	f.calls = append(f.calls, req.GetNamespace())
	f.metadata = append(f.metadata, md)
	f.mu.Unlock()

	if req.GetNamespace() == "frontend-down" {
		return nil, status.Error(codes.Unavailable, "frontend is not available")
	}

	if f.requireAuth {
		token := ""
		if values := md.Get("authorization"); len(values) > 0 {
			token = values[0]
		}
		switch token {
		case goodToken:
		case readOnlyToken:
			return nil, status.Error(codes.PermissionDenied, "Request unauthorized.")
		default:
			return nil, status.Error(codes.Unauthenticated, "invalid token")
		}
	}

	if req.GetNamespace() != "orders-prod" && req.GetNamespace() != literalNamespace {
		return nil, status.Errorf(codes.NotFound, "Namespace %s is not found.", req.GetNamespace())
	}
	return &workflowservice.DescribeNamespaceResponse{}, nil
}

func (f *fakeFrontend) callCount() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.calls)
}

// newFakeFrontendConn serves the fake frontend on an in-memory listener: no network.
func newFakeFrontendConn(t *testing.T, frontend *fakeFrontend) *grpc.ClientConn {
	t.Helper()

	listener := bufconn.Listen(1 << 20)
	server := grpc.NewServer()
	workflowservice.RegisterWorkflowServiceServer(server, frontend)
	go func() { _ = server.Serve(listener) }()
	t.Cleanup(server.Stop)

	conn, err := grpc.NewClient("passthrough:///bufnet",
		grpc.WithContextDialer(func(ctx context.Context, _ string) (net.Conn, error) { return listener.DialContext(ctx) }),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })

	return conn
}

// forwardExtras is the same kind of API middleware that the server installs: it
// forwards the Authorization-Extras header to the frontend.
func forwardExtras(c echo.Context) runtime.ServeMuxOption {
	return runtime.WithMetadata(func(ctx context.Context, req *http.Request) metadata.MD {
		md := metadata.MD{}
		if value := c.Request().Header.Get(extrasHeader); value != "" {
			md.Append(extrasHeader, value)
		}
		return md
	})
}

const (
	nlSearchTestAPIKey = "sk-nl-search-secret"
	nlSearchValidBody  = `{
		"namespace": "orders-prod",
		"text": "failed workflows from yesterday",
		"now": "2026-09-20T15:04:05Z",
		"timezoneOffsetMinutes": -240,
		"searchAttributes": {"WorkflowType": "Keyword"},
		"customAttributeNames": [],
		"knownWorkflowTypes": ["OrderWorkflow"]
	}`
)

// fakeJev answers each question with "no", except the Failed status and the yesterday range.
func fakeJev(t *testing.T, calls *atomic.Int32, status int, delay time.Duration) *httptest.Server {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		assert.Equal(t, "Bearer "+nlSearchTestAPIKey, r.Header.Get("Authorization"))

		if delay > 0 {
			select {
			case <-time.After(delay):
			case <-r.Context().Done():
				return
			}
		}
		if status != http.StatusOK {
			w.WriteHeader(status)
			_, _ = io.WriteString(w, `{"error":"upstream detail"}`)
			return
		}

		var req struct {
			Questions map[string]struct {
				Type string `json:"type"`
			} `json:"questions"`
		}
		require.NoError(t, json.NewDecoder(r.Body).Decode(&req))

		answers := map[string]any{}
		for id, question := range req.Questions {
			switch {
			case id == "status_Failed":
				answers[id] = map[string]any{"type": "noul", "noul": 0.97}
			case id == "time_range":
				answers[id] = map[string]any{"type": "choice", "choice": "yesterday", "confidence": 0.88}
			case id == "time_direction":
				answers[id] = map[string]any{"type": "choice", "choice": "within_range", "confidence": 0.95}
			case question.Type == "noul":
				answers[id] = map[string]any{"type": "noul", "noul": 0.02}
			default:
				answers[id] = map[string]any{"type": "choice", "choice": "none", "confidence": 0.95}
			}
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"model": "jev-test", "answers": answers})
	}))
	t.Cleanup(srv.Close)

	return srv
}

type nlSearchTestCase struct {
	name            string
	disabled        bool
	noAPIKey        bool
	authEnabled     bool
	frontendAuth    bool
	authHeader      string
	body            string
	upstreamStatus  int
	upstreamDelay   time.Duration
	timeout         time.Duration
	wantStatus      int
	wantFrontend    bool
	wantUpstream    bool
	wantMessagePart string
	// wantNamespace is the literal value that the frontend must receive.
	wantNamespace string
}

func TestNLSearchHandler(t *testing.T) {
	body := func(namespace string) string {
		return strings.Replace(nlSearchValidBody, "orders-prod", namespace, 1)
	}

	tests := []nlSearchTestCase{
		{name: "translates the request", body: nlSearchValidBody, wantStatus: http.StatusOK, wantFrontend: true, wantUpstream: true},
		{name: "feature off", disabled: true, body: nlSearchValidBody, wantStatus: http.StatusNotFound, wantMessagePart: "not enabled"},
		{name: "no API key means off", noAPIKey: true, body: nlSearchValidBody, wantStatus: http.StatusNotFound, wantMessagePart: "not enabled"},

		// Authorization. The ui-server checks only that the header exists. The frontend decides.
		{name: "auth enabled without a header", authEnabled: true, frontendAuth: true, body: nlSearchValidBody, wantStatus: http.StatusUnauthorized, wantMessagePart: "unauthorized"},
		{name: "the frontend accepts the credentials", authEnabled: true, frontendAuth: true, authHeader: goodToken, body: nlSearchValidBody, wantStatus: http.StatusOK, wantFrontend: true, wantUpstream: true},
		{name: "the frontend rejects an invented token", authEnabled: true, frontendAuth: true, authHeader: "Bearer x", body: nlSearchValidBody, wantStatus: http.StatusUnauthorized, wantFrontend: true, wantMessagePart: "unauthorized"},
		{name: "the frontend denies access to the namespace", authEnabled: true, frontendAuth: true, authHeader: readOnlyToken, body: nlSearchValidBody, wantStatus: http.StatusForbidden, wantFrontend: true, wantMessagePart: "orders-prod"},
		{name: "the frontend authorizes also when ui-server auth is off", frontendAuth: true, body: nlSearchValidBody, wantStatus: http.StatusUnauthorized, wantFrontend: true, wantMessagePart: "unauthorized"},
		{name: "namespace not found", body: body("no-such-namespace"), wantStatus: http.StatusBadRequest, wantFrontend: true, wantMessagePart: `namespace "no-such-namespace" was not found`},
		{name: "frontend failure", body: body("frontend-down"), wantStatus: http.StatusBadGateway, wantFrontend: true, wantMessagePart: "unable to verify access"},

		// Validation happens before the frontend call and the TypeSafe call.
		{name: "missing namespace", body: `{"text": "failed", "now": "2026-09-20T15:04:05Z"}`, wantStatus: http.StatusBadRequest, wantMessagePart: "namespace is required"},
		{name: "namespace with dot, dash, and underscore", body: body(literalNamespace), wantStatus: http.StatusOK, wantFrontend: true, wantUpstream: true, wantNamespace: literalNamespace},
		{name: "namespace with a path traversal", body: body("a/../b"), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace with a query", body: body("x?y"), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace with a fragment", body: body("x#y"), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace with an escape", body: body("%2F"), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace with a backslash", body: body(`a\\b`), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace with a control character", body: body(`a\u0000b`), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace with a line break", body: body(`a\nb`), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace has a character"},
		{name: "namespace too long", body: body(strings.Repeat("n", nlsearch.MaxNameLength+1)), wantStatus: http.StatusBadRequest, wantMessagePart: "namespace"},
		{name: "malformed JSON", body: `{"text": `, wantStatus: http.StatusBadRequest, wantMessagePart: "invalid request body"},
		{name: "malformed now", body: `{"namespace": "orders-prod", "text": "failed", "now": "yesterday"}`, wantStatus: http.StatusBadRequest, wantMessagePart: "invalid request body"},
		{name: "text too long", body: `{"namespace": "orders-prod", "text": "` + strings.Repeat("a", nlsearch.MaxTextLength+1) + `", "now": "2026-09-20T15:04:05Z"}`, wantStatus: http.StatusBadRequest, wantMessagePart: "text"},
		{name: "body over the size limit", body: `{"namespace": "orders-prod", "now": "2026-09-20T15:04:05Z", "text": "failed", "padding": "` + strings.Repeat("p", maxNLSearchBodyBytes) + `"}`, wantStatus: http.StatusBadRequest, wantMessagePart: "invalid request body"},

		{name: "upstream rejects the API key", body: nlSearchValidBody, upstreamStatus: http.StatusUnauthorized, wantStatus: http.StatusBadGateway, wantFrontend: true, wantUpstream: true, wantMessagePart: "not available"},
		{name: "upstream server error", body: nlSearchValidBody, upstreamStatus: http.StatusInternalServerError, wantStatus: http.StatusBadGateway, wantFrontend: true, wantUpstream: true, wantMessagePart: "not available"},
		{name: "upstream timeout", body: nlSearchValidBody, upstreamDelay: 2 * time.Second, timeout: 100 * time.Millisecond, wantStatus: http.StatusGatewayTimeout, wantFrontend: true, wantUpstream: true, wantMessagePart: "timed out"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			upstreamStatus := tt.upstreamStatus
			if upstreamStatus == 0 {
				upstreamStatus = http.StatusOK
			}
			var calls atomic.Int32
			upstream := fakeJev(t, &calls, upstreamStatus, tt.upstreamDelay)

			frontend := &fakeFrontend{requireAuth: tt.frontendAuth}
			conn := newFakeFrontendConn(t, frontend)

			cfg := &config.Config{}
			cfg.Auth.Enabled = tt.authEnabled
			cfg.NLSearch.Enabled = !tt.disabled
			// The other feature is on: its gate must not open this endpoint.
			cfg.HistoryReview.Enabled = true
			cfg.TypeSafe = config.TypeSafe{APIKey: nlSearchTestAPIKey, BaseURL: upstream.URL, Timeout: tt.timeout}
			if tt.noAPIKey {
				cfg.TypeSafe.APIKey = ""
			}

			cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
			require.NoError(t, err)
			defer cfgProvider.Close()

			e := echo.New()
			req := httptest.NewRequest(http.MethodPost, "/api/v1/nl-search", strings.NewReader(tt.body))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			if tt.authHeader != "" {
				req.Header.Set(echo.HeaderAuthorization, tt.authHeader)
			}
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handler := NLSearchHandler(NewTypeSafeGate(cfgProvider, []Middleware{forwardExtras}, conn, ratelimit.New(ratelimit.Options{})))
			require.NoError(t, handler(c), "the handler writes each error in its own format")

			assert.Equal(t, tt.wantStatus, rec.Code)
			assert.Equal(t, tt.wantFrontend, frontend.callCount() > 0, "frontend calls")
			if tt.wantNamespace != "" {
				assert.Equal(t, []string{tt.wantNamespace}, frontend.calls)
			}
			assert.Equal(t, tt.wantUpstream, calls.Load() > 0, "TypeSafe calls")
			if tt.wantStatus != http.StatusOK && !tt.wantUpstream {
				assert.Zero(t, calls.Load(), "a request that the server rejects must not reach the paid API")
			}
			assert.NotContains(t, rec.Body.String(), nlSearchTestAPIKey)
			assert.NotContains(t, rec.Body.String(), "upstream detail")

			if tt.wantStatus != http.StatusOK {
				var body TypeSafeErrorResponse
				require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
				assert.NotEmpty(t, body.Message)
				assert.Contains(t, body.Message, tt.wantMessagePart)
				return
			}

			var result nlsearch.Result
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &result))
			assert.True(t, result.Understood)
			assert.InDelta(t, 0.88, result.Confidence, 1e-9)
			assert.Equal(t, []nlsearch.Filter{
				{Attribute: "ExecutionStatus", Type: "Keyword", Conditional: "=", Value: "Failed", Confidence: 0.97},
				{Attribute: "StartTime", Type: "Datetime", Conditional: ">=", Value: "2026-09-19T04:00:00Z", Confidence: 0.88},
				{Attribute: "StartTime", Type: "Datetime", Conditional: "<", Value: "2026-09-20T04:00:00Z", Confidence: 0.88},
			}, result.Filters)
			assert.Contains(t, rec.Body.String(), `"filters":[{"attribute":"ExecutionStatus","type":"Keyword","conditional":"=","value":"Failed","confidence":0.97}`)
		})
	}
}

// The namespace check must carry the credentials of the caller in the same way as the
// catch-all proxy: Authorization through the gateway, the other headers through the API middleware.
func TestNLSearchHandlerForwardsCredentialsToTheFrontend(t *testing.T) {
	var calls atomic.Int32
	upstream := fakeJev(t, &calls, http.StatusOK, 0)
	frontend := &fakeFrontend{requireAuth: true}
	conn := newFakeFrontendConn(t, frontend)

	cfg := typeSafeTestConfig(upstream.URL)
	cfg.Auth.Enabled = true
	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nl-search", strings.NewReader(nlSearchValidBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set(echo.HeaderAuthorization, goodToken)
	req.Header.Set(extrasHeader, "id-token-value")
	rec := httptest.NewRecorder()

	handler := NLSearchHandler(NewTypeSafeGate(cfgProvider, []Middleware{forwardExtras}, conn, ratelimit.New(ratelimit.Options{})))
	require.NoError(t, handler(e.NewContext(req, rec)))
	require.Equal(t, http.StatusOK, rec.Code)

	require.Equal(t, []string{"orders-prod"}, frontend.calls)
	md := frontend.metadata[0]
	assert.Equal(t, []string{goodToken}, md.Get("authorization"))
	assert.Equal(t, []string{"id-token-value"}, md.Get(extrasHeader))
	assert.NotEmpty(t, md.Get("client-name"), "the version headers go to the frontend too")
	assert.Equal(t, int32(1), calls.Load())
}

func TestNLSearchHandlerClientCancel(t *testing.T) {
	var calls atomic.Int32
	upstream := fakeJev(t, &calls, http.StatusOK, 2*time.Second)
	conn := newFakeFrontendConn(t, &fakeFrontend{})

	cfg := typeSafeTestConfig(upstream.URL)
	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	ctx, cancel := context.WithCancel(context.Background())
	time.AfterFunc(100*time.Millisecond, cancel)

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nl-search", strings.NewReader(nlSearchValidBody)).WithContext(ctx)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	handler := NLSearchHandler(NewTypeSafeGate(cfgProvider, nil, conn, ratelimit.New(ratelimit.Options{})))
	require.NoError(t, handler(e.NewContext(req, rec)))
	assert.Equal(t, statusClientClosedRequest, rec.Code)
	assert.NotEqual(t, http.StatusBadGateway, rec.Code)
}

// rateLimitHarness sends requests to one handler with one limiter.
type rateLimitHarness struct {
	t        *testing.T
	handler  echo.HandlerFunc
	echo     *echo.Echo
	provider *reloadableConfigProvider
	upstream *httptest.Server
	calls    *atomic.Int32
}

func newRateLimitHarness(t *testing.T, rateLimit config.TypeSafeRateLimit) (*rateLimitHarness, *config.ConfigProviderWithRefresh) {
	t.Helper()

	h := &rateLimitHarness{t: t, echo: echo.New(), provider: &reloadableConfigProvider{}, calls: &atomic.Int32{}}
	h.upstream = fakeJev(t, h.calls, http.StatusOK, 0)
	h.setRateLimit(rateLimit)

	cfgProvider, err := config.NewConfigProviderWithRefresh(h.provider)
	require.NoError(t, err)
	t.Cleanup(cfgProvider.Close)

	conn := newFakeFrontendConn(t, &fakeFrontend{})
	h.handler = NLSearchHandler(NewTypeSafeGate(cfgProvider, nil, conn, ratelimit.New(ratelimit.Options{})))
	return h, cfgProvider
}

func (h *rateLimitHarness) setRateLimit(rateLimit config.TypeSafeRateLimit) {
	h.provider.set(&config.Config{
		RefreshInterval: 5 * time.Millisecond,
		NLSearch:        config.NLSearch{Enabled: true},
		HistoryReview:   config.HistoryReview{Enabled: true},
		TypeSafe:        config.TypeSafe{APIKey: nlSearchTestAPIKey, BaseURL: h.upstream.URL, RateLimit: rateLimit},
	})
}

func (h *rateLimitHarness) send(authHeader, remoteAddr, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nl-search", strings.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.RemoteAddr = remoteAddr
	// Without an IPExtractor, a forwarding header must not select the bucket.
	req.Header.Set(echo.HeaderXForwardedFor, "10.9.8."+strconv.Itoa(int(h.calls.Load())%250))
	if authHeader != "" {
		req.Header.Set(echo.HeaderAuthorization, authHeader)
	}
	rec := httptest.NewRecorder()
	require.NoError(h.t, h.handler(h.echo.NewContext(req, rec)))
	return rec
}

func TestNLSearchHandlerRateLimitForEachCaller(t *testing.T) {
	h, cfgProvider := newRateLimitHarness(t, config.TypeSafeRateLimit{RequestsPerMinute: 1, Burst: 3})

	// The burst passes, then the caller gets 429 with Retry-After and no paid call.
	for i := 0; i < 3; i++ {
		assert.Equal(t, http.StatusOK, h.send("Bearer alice", "192.0.2.1:1001", nlSearchValidBody).Code, "request %d", i)
	}
	require.Equal(t, int32(3), h.calls.Load())

	// The limit check happens before the body is read: a bad body gets 429 too.
	rec := h.send("Bearer alice", "192.0.2.1:1001", `{"text": `)
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, "60", rec.Header().Get(echo.HeaderRetryAfter))
	var body TypeSafeErrorResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
	assert.Contains(t, body.Message, "too many")
	assert.Equal(t, int32(3), h.calls.Load(), "a limited request must not reach the paid API")

	// A different token is a different caller, from the same address.
	assert.Equal(t, http.StatusOK, h.send("Bearer bob", "192.0.2.1:1001", nlSearchValidBody).Code)

	// Without a token, the remote IP is the caller. A change of X-Forwarded-For or of the port is the same caller.
	for i := 0; i < 3; i++ {
		assert.Equal(t, http.StatusOK, h.send("", "192.0.2.7:200"+strconv.Itoa(i), nlSearchValidBody).Code)
	}
	assert.Equal(t, http.StatusTooManyRequests, h.send("", "192.0.2.7:2009", nlSearchValidBody).Code)
	assert.Equal(t, http.StatusOK, h.send("", "192.0.2.8:2000", nlSearchValidBody).Code)

	// A config reload with "disabled: true" turns the limit off, without a restart.
	h.setRateLimit(config.TypeSafeRateLimit{Disabled: true})
	require.Eventually(t, func() bool {
		cfg, _ := cfgProvider.GetConfig()
		return cfg.TypeSafe.RateLimit.Disabled
	}, 2*time.Second, 5*time.Millisecond)
	for i := 0; i < 70; i++ {
		require.Equal(t, http.StatusOK, h.send("Bearer alice", "192.0.2.1:1001", nlSearchValidBody).Code)
	}

	// A config reload with a new limit applies to the same limiter.
	h.setRateLimit(config.TypeSafeRateLimit{RequestsPerMinute: 2, Burst: 1})
	require.Eventually(t, func() bool {
		cfg, _ := cfgProvider.GetConfig()
		return cfg.TypeSafe.RateLimit.RequestsPerMinute == 2
	}, 2*time.Second, 5*time.Millisecond)
	assert.Equal(t, http.StatusOK, h.send("Bearer carol", "192.0.2.9:1001", nlSearchValidBody).Code)
	rec = h.send("Bearer carol", "192.0.2.9:1001", nlSearchValidBody)
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, "30", rec.Header().Get(echo.HeaderRetryAfter))
}

// A config that a Go program builds, or a config with no rateLimit block, has the
// default limit. The limit is never off without "disabled: true".
func TestNLSearchHandlerRateLimitIsOnWithoutARateLimitBlock(t *testing.T) {
	h, _ := newRateLimitHarness(t, config.TypeSafeRateLimit{})

	for i := 0; i < config.DefaultTypeSafeBurst; i++ {
		require.Equal(t, http.StatusOK, h.send("Bearer alice", "192.0.2.1:1001", nlSearchValidBody).Code, "request %d", i)
	}

	rec := h.send("Bearer alice", "192.0.2.1:1001", nlSearchValidBody)
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, "2", rec.Header().Get(echo.HeaderRetryAfter))
	assert.Equal(t, int32(config.DefaultTypeSafeBurst), h.calls.Load())
}

// A caller that rotates tokens gets a new caller bucket for each token. The bucket
// of its IP stops it at 4 times the caller burst.
func TestNLSearchHandlerRateLimitForEachIP(t *testing.T) {
	h, _ := newRateLimitHarness(t, config.TypeSafeRateLimit{RequestsPerMinute: 1, Burst: 3})

	for i := 0; i < 12; i++ {
		require.Equal(t, http.StatusOK, h.send("Bearer rotated-"+strconv.Itoa(i), "192.0.2.1:1001", nlSearchValidBody).Code, "request %d", i)
	}
	rec := h.send("Bearer rotated-12", "192.0.2.1:1001", nlSearchValidBody)
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, "15", rec.Header().Get(echo.HeaderRetryAfter), "4 requests a minute for the IP")
	assert.Equal(t, int32(12), h.calls.Load())

	// A different IP has its own bucket.
	assert.Equal(t, http.StatusOK, h.send("Bearer rotated-13", "192.0.2.2:1001", nlSearchValidBody).Code)
}

// A caller that rotates tokens and addresses stops at the bucket of the deployment.
// That bucket protects the quota of the TypeSafe key.
func TestNLSearchHandlerRateLimitForTheDeployment(t *testing.T) {
	h, _ := newRateLimitHarness(t, config.TypeSafeRateLimit{RequestsPerMinute: 1, Burst: 2, DeploymentRequestsPerMinute: 30})

	// The deployment burst is max(burst, 30/6) = 5.
	for i := 0; i < 5; i++ {
		addr := "192.0.2." + strconv.Itoa(i+1) + ":1001"
		require.Equal(t, http.StatusOK, h.send("Bearer rotated-"+strconv.Itoa(i), addr, nlSearchValidBody).Code, "request %d", i)
	}
	rec := h.send("Bearer rotated-new", "192.0.2.200:1001", nlSearchValidBody)
	assert.Equal(t, http.StatusTooManyRequests, rec.Code)
	assert.Equal(t, "2", rec.Header().Get(echo.HeaderRetryAfter), "30 requests a minute for the deployment")
	assert.Equal(t, int32(5), h.calls.Load())
}

func TestTypeSafeRateLimitChecks(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.RemoteAddr = "192.0.2.1:4321"
	req.Header.Set(echo.HeaderAuthorization, "Bearer secret-token")
	c := e.NewContext(req, httptest.NewRecorder())

	assert.Nil(t, TypeSafeRateLimitChecks(c, "nl-search", config.TypeSafeRateLimit{Disabled: true, RequestsPerMinute: 30}))

	checks := TypeSafeRateLimitChecks(c, "nl-search", config.TypeSafe{}.WithDefaults().RateLimit)
	require.Len(t, checks, 3)
	assert.Equal(t, ratelimit.Check{Scope: "typesafe:deployment", Limit: ratelimit.Limit{RequestsPerMinute: 300, Burst: 50}}, checks[0])
	assert.Equal(t, ratelimit.Check{Scope: "nl-search:ip", Key: "192.0.2.1", Limit: ratelimit.Limit{RequestsPerMinute: 120, Burst: 40}}, checks[1])
	assert.Equal(t, "nl-search:caller", checks[2].Scope)
	assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 30, Burst: 10}, checks[2].Limit)
	assert.NotContains(t, checks[2].Key, "secret-token")

	// A second endpoint shares the deployment bucket and no other bucket.
	other := TypeSafeRateLimitChecks(c, "history-review", config.TypeSafe{}.WithDefaults().RateLimit)
	assert.Equal(t, checks[0], other[0])
	assert.Equal(t, "history-review:ip", other[1].Scope)
	assert.Equal(t, "history-review:caller", other[2].Scope)
}

func TestTypeSafeRateLimitChecksNeverMeanNoLimit(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.RemoteAddr = "192.0.2.1:4321"
	c := e.NewContext(req, httptest.NewRecorder())

	t.Run("a zero value gets the defaults", func(t *testing.T) {
		checks := TypeSafeRateLimitChecks(c, "nl-search", config.TypeSafeRateLimit{})
		require.Len(t, checks, 3)
		assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 300, Burst: 50}, checks[0].Limit)
		assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 120, Burst: 40}, checks[1].Limit)
		assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 30, Burst: 10}, checks[2].Limit)
		for _, check := range checks {
			assert.True(t, check.Limit.Enabled(), check.Scope)
		}
	})

	t.Run("the deployment burst is never above one minute of the deployment rate", func(t *testing.T) {
		checks := TypeSafeRateLimitChecks(c, "nl-search", config.TypeSafeRateLimit{RequestsPerMinute: 30, Burst: 100, DeploymentRequestsPerMinute: 30})
		assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 30, Burst: 30}, checks[0].Limit)
		assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 30, Burst: 100}, checks[2].Limit)
	})

	t.Run("the deployment burst is at least the caller burst", func(t *testing.T) {
		checks := TypeSafeRateLimitChecks(c, "nl-search", config.TypeSafeRateLimit{RequestsPerMinute: 30, Burst: 20, DeploymentRequestsPerMinute: 60})
		assert.Equal(t, ratelimit.Limit{RequestsPerMinute: 60, Burst: 20}, checks[0].Limit)
	})
}

// Two endpoints use one Limiter and one TypeSafe key. The spend of the first
// endpoint counts against the second, and their IP and caller buckets stay apart.
func TestTwoEndpointsShareTheDeploymentBucket(t *testing.T) {
	now := time.Date(2026, time.September, 20, 12, 0, 0, 0, time.UTC)
	limiter := ratelimit.New(ratelimit.Options{Now: func() time.Time { return now }})
	rateLimit := config.TypeSafeRateLimit{RequestsPerMinute: 60, Burst: 2, DeploymentRequestsPerMinute: 18} // deployment burst: max(2, 3) = 3

	e := echo.New()
	checks := func(endpoint, token string) []ratelimit.Check {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.RemoteAddr = "192.0.2.1:4321"
		req.Header.Set(echo.HeaderAuthorization, token)
		return TypeSafeRateLimitChecks(e.NewContext(req, httptest.NewRecorder()), endpoint, rateLimit)
	}

	for i := 0; i < 2; i++ {
		ok, _ := limiter.Allow(checks("nl-search", "Bearer alice")...)
		require.True(t, ok)
	}
	// Alice is at her nl-search caller limit. Her history-review caller bucket is a different bucket.
	ok, _ := limiter.Allow(checks("history-review", "Bearer alice")...)
	assert.True(t, ok, "the caller buckets of two endpoints are apart")

	// The 3 tokens of the deployment are gone: the first endpoint used 2 of them.
	ok, retryAfter := limiter.Allow(checks("history-review", "Bearer bob")...)
	assert.False(t, ok, "the spend of nl-search counts against history-review")
	assert.InDelta(t, (60.0/18)*float64(time.Second), float64(retryAfter), float64(time.Millisecond))
}

// An authorization gate must not allow a request when it learned nothing.
func TestNamespaceCheckResult(t *testing.T) {
	recorder := &statusRecorder{header: http.Header{}}
	assert.Equal(t, 0, recorder.Status(), "no write means no status, not 200")
	_, _ = recorder.Write([]byte("{}"))
	assert.Equal(t, http.StatusOK, recorder.Status())

	tests := map[string]struct {
		checkStatus int
		canceled    bool
		want        int
	}{
		"explicit 200 allows":             {checkStatus: http.StatusOK, want: http.StatusOK},
		"nothing written denies":          {checkStatus: 0, want: http.StatusBadGateway},
		"204 is not an answer":            {checkStatus: http.StatusNoContent, want: http.StatusBadGateway},
		"unauthenticated":                 {checkStatus: http.StatusUnauthorized, want: http.StatusUnauthorized},
		"permission denied":               {checkStatus: http.StatusForbidden, want: http.StatusForbidden},
		"not found":                       {checkStatus: http.StatusNotFound, want: http.StatusBadRequest},
		"deadline":                        {checkStatus: http.StatusGatewayTimeout, want: http.StatusGatewayTimeout},
		"unavailable":                     {checkStatus: http.StatusServiceUnavailable, want: http.StatusBadGateway},
		"internal":                        {checkStatus: http.StatusInternalServerError, want: http.StatusBadGateway},
		"caller canceled":                 {checkStatus: 499, canceled: true, want: statusClientClosedRequest},
		"caller canceled, nothing known":  {checkStatus: 0, canceled: true, want: statusClientClosedRequest},
		"a denial wins over a cancel":     {checkStatus: http.StatusForbidden, canceled: true, want: http.StatusForbidden},
		"caller canceled after an accept": {checkStatus: http.StatusOK, canceled: true, want: http.StatusOK},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			got, message := namespaceCheckResult(tt.checkStatus, tt.canceled, "orders-prod")
			assert.Equal(t, tt.want, got)
			assert.Equal(t, got == http.StatusOK, message == "", "only an accept has no message")
		})
	}
}

func TestRateLimitCallerKey(t *testing.T) {
	e := echo.New()
	key := func(authHeader, remoteAddr string) string {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.RemoteAddr = remoteAddr
		if authHeader != "" {
			req.Header.Set(echo.HeaderAuthorization, authHeader)
		}
		return RateLimitCallerKey(e.NewContext(req, httptest.NewRecorder()))
	}

	assert.Equal(t, key("Bearer secret-token", "192.0.2.1:1"), key("Bearer secret-token", "192.0.2.2:2"))
	assert.NotEqual(t, key("Bearer secret-token", "192.0.2.1:1"), key("Bearer other-token", "192.0.2.1:1"))
	assert.NotContains(t, key("Bearer secret-token", "192.0.2.1:1"), "secret-token")
	assert.Equal(t, "ip:192.0.2.1", key("", "192.0.2.1:4321"))
}

type reloadableConfigProvider struct {
	mu  sync.Mutex
	cfg *config.Config
}

func (p *reloadableConfigProvider) GetConfig() (*config.Config, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.cfg, nil
}

func (p *reloadableConfigProvider) set(cfg *config.Config) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.cfg = cfg
}

func TestNLSearchHandlerNotUnderstood(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.WriteString(w, `{"model": "jev-test", "answers": {}}`)
	}))
	defer upstream.Close()

	cfg := typeSafeTestConfig(upstream.URL)
	cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: cfg})
	require.NoError(t, err)
	defer cfgProvider.Close()

	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nl-search", strings.NewReader(nlSearchValidBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	conn := newFakeFrontendConn(t, &fakeFrontend{})
	require.NoError(t, NLSearchHandler(NewTypeSafeGate(cfgProvider, nil, conn, ratelimit.New(ratelimit.Options{})))(e.NewContext(req, rec)))
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.JSONEq(t, `{"filters": [], "confidence": 0, "understood": false}`, rec.Body.String())
}

func TestGetSettingsTypeSafeFeatureFlags(t *testing.T) {
	tests := map[string]struct {
		cfg               config.Config
		wantNLSearch      bool
		wantHistoryReview bool
	}{
		"off by default": {cfg: config.Config{}},
		"enabled without a key": {
			cfg: config.Config{NLSearch: config.NLSearch{Enabled: true}, HistoryReview: config.HistoryReview{Enabled: true}},
		},
		"key without a gate": {
			cfg: config.Config{TypeSafe: config.TypeSafe{APIKey: nlSearchTestAPIKey}},
		},
		"only nl-search": {
			cfg:          config.Config{TypeSafe: config.TypeSafe{APIKey: nlSearchTestAPIKey}, NLSearch: config.NLSearch{Enabled: true}},
			wantNLSearch: true,
		},
		"only history review": {
			cfg:               config.Config{TypeSafe: config.TypeSafe{APIKey: nlSearchTestAPIKey}, HistoryReview: config.HistoryReview{Enabled: true}},
			wantHistoryReview: true,
		},
		"both": {
			cfg: config.Config{
				TypeSafe: config.TypeSafe{APIKey: nlSearchTestAPIKey},
				NLSearch: config.NLSearch{Enabled: true}, HistoryReview: config.HistoryReview{Enabled: true},
			},
			wantNLSearch: true, wantHistoryReview: true,
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			cfgProvider, err := config.NewConfigProviderWithRefresh(&mockConfigProvider{cfg: &tt.cfg})
			require.NoError(t, err)
			defer cfgProvider.Close()

			e := echo.New()
			rec := httptest.NewRecorder()
			c := e.NewContext(httptest.NewRequest(http.MethodGet, "/api/v1/settings", nil), rec)
			require.NoError(t, GetSettings(cfgProvider)(c))

			var settings SettingsResponse
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &settings))
			assert.Equal(t, tt.wantNLSearch, settings.NLSearchEnabled)
			assert.Equal(t, tt.wantHistoryReview, settings.HistoryReviewEnabled)
			assert.NotContains(t, rec.Body.String(), nlSearchTestAPIKey)
		})
	}
}

// typeSafeTestConfig has both features on, and the fake TypeSafe server as the base URL.
func typeSafeTestConfig(baseURL string) *config.Config {
	return &config.Config{
		TypeSafe:      config.TypeSafe{APIKey: nlSearchTestAPIKey, BaseURL: baseURL},
		NLSearch:      config.NLSearch{Enabled: true},
		HistoryReview: config.HistoryReview{Enabled: true},
	}
}
