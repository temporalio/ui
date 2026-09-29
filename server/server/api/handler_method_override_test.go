package api

import (
	"context"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	workflowservice "go.temporal.io/api/workflowservice/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"
)

// invokedMethods records the gRPC methods a request reached, which is what the
// mux's routing decision actually amounts to. Status codes cannot show it: every
// unimplemented method answers alike, so a request routed to the wrong RPC looks
// exactly like one routed to the right one.
type invokedMethods struct {
	mu      sync.Mutex
	methods []string
}

func (i *invokedMethods) record(method string) {
	i.mu.Lock()
	defer i.mu.Unlock()
	i.methods = append(i.methods, method)
}

func (i *invokedMethods) last() string {
	i.mu.Lock()
	defer i.mu.Unlock()
	if len(i.methods) == 0 {
		return ""
	}
	return i.methods[len(i.methods)-1]
}

func newMethodRecordingConnection(t *testing.T, invoked *invokedMethods) *grpc.ClientConn {
	t.Helper()

	listener := bufconn.Listen(1024 * 1024)
	server := grpc.NewServer(grpc.UnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
			invoked.record(info.FullMethod)
			return handler(ctx, req)
		},
	))
	workflowservice.RegisterWorkflowServiceServer(server, &workflowservice.UnimplementedWorkflowServiceServer{})
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

// TestMuxIgnoresHTTPMethodOverride covers CVE-2026-37236.
//
// grpc-gateway's mux honours X-HTTP-Method-Override on a POST sent as
// application/x-www-form-urlencoded, rewriting the method before routing. Anything
// in front of this that allows or denies by method — a proxy, a WAF — would be
// deciding on a method the mux then discards, so a POST permitted by that layer
// could arrive here as a DELETE.
//
// The upstream fix is opt-in: the behaviour persists on current versions unless
// runtime.WithDisableHTTPMethodOverride() is passed. Upgrading alone satisfies a
// scanner and changes nothing, so this asserts the behaviour rather than the
// version.
func TestMuxIgnoresHTTPMethodOverride(t *testing.T) {
	const schedulePath = "/api/v1/namespaces/test-namespace/schedules/test-schedule"

	invoked := &invokedMethods{}
	echoCtx := echo.New().NewContext(
		httptest.NewRequest(http.MethodGet, "/", nil),
		httptest.NewRecorder(),
	)
	mux, err := getTemporalClientMux(echoCtx, newMethodRecordingConnection(t, invoked), nil)
	require.NoError(t, err)

	send := func(method, contentType, override string) string {
		req := httptest.NewRequest(method, schedulePath, strings.NewReader(""))
		if contentType != "" {
			req.Header.Set("Content-Type", contentType)
		}
		if override != "" {
			req.Header.Set("X-HTTP-Method-Override", override)
		}
		mux.ServeHTTP(httptest.NewRecorder(), req)
		return invoked.last()
	}

	// This path routes three different methods to three different RPCs, so which
	// one a request reaches is unambiguous.
	require.Equal(t, createSchedule, send(http.MethodPost, "application/json", ""),
		"a plain POST should create")
	require.Equal(t, deleteSchedule, send(http.MethodDelete, "", ""),
		"a real DELETE should delete")

	// The attack: a POST that asks to be treated as a DELETE. It must still create.
	assert.Equal(t, createSchedule,
		send(http.MethodPost, "application/x-www-form-urlencoded", "DELETE"),
		"X-HTTP-Method-Override must not turn a POST into a DELETE")
}

const (
	createSchedule = "/temporal.api.workflowservice.v1.WorkflowService/CreateSchedule"
	deleteSchedule = "/temporal.api.workflowservice.v1.WorkflowService/DeleteSchedule"
)
