package rpc

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

type fakeRequest struct {
	namespace string
}

func (r *fakeRequest) GetNamespace() string { return r.namespace }

func runInterceptor(t *testing.T, apiKey string, ctx context.Context, req interface{}) metadata.MD {
	t.Helper()

	var got metadata.MD
	invoker := func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, opts ...grpc.CallOption) error {
		got, _ = metadata.FromOutgoingContext(ctx)
		return nil
	}

	err := apiKeyInterceptor(apiKey)(ctx, "/test/Method", req, nil, nil, invoker)
	require.NoError(t, err)

	return got
}

func TestAPIKeyInterceptor_NoAPIKeyLeavesContextUntouched(t *testing.T) {
	md := runInterceptor(t, "", context.Background(), &fakeRequest{namespace: "ns"})

	require.Empty(t, md.Get("authorization"))
	require.Empty(t, md.Get("temporal-namespace"))
}

func TestAPIKeyInterceptor_SetsAuthorizationAndNamespace(t *testing.T) {
	md := runInterceptor(t, "secret", context.Background(), &fakeRequest{namespace: "ns.acct"})

	require.Equal(t, []string{"Bearer secret"}, md.Get("authorization"))
	require.Equal(t, []string{"ns.acct"}, md.Get("temporal-namespace"))
}

func TestAPIKeyInterceptor_OmitsNamespaceWhenEmptyOrUnsupported(t *testing.T) {
	md := runInterceptor(t, "secret", context.Background(), &fakeRequest{})
	require.Equal(t, []string{"Bearer secret"}, md.Get("authorization"))
	require.Empty(t, md.Get("temporal-namespace"))

	md = runInterceptor(t, "secret", context.Background(), struct{}{})
	require.Equal(t, []string{"Bearer secret"}, md.Get("authorization"))
	require.Empty(t, md.Get("temporal-namespace"))
}

func TestAPIKeyInterceptor_ReplacesExistingHeadersAndKeepsOthers(t *testing.T) {
	ctx := metadata.AppendToOutgoingContext(context.Background(),
		"authorization", "Bearer stale",
		"temporal-namespace", "stale",
		"x-other", "keep",
	)

	md := runInterceptor(t, "secret", ctx, &fakeRequest{namespace: "fresh"})

	require.Equal(t, []string{"Bearer secret"}, md.Get("authorization"))
	require.Equal(t, []string{"fresh"}, md.Get("temporal-namespace"))
	require.Equal(t, []string{"keep"}, md.Get("x-other"))
}

func TestAPIKeyInterceptor_DoesNotMutateCallerMetadata(t *testing.T) {
	ctx := metadata.AppendToOutgoingContext(context.Background(), "x-other", "keep")

	runInterceptor(t, "secret", ctx, &fakeRequest{namespace: "ns"})

	original, _ := metadata.FromOutgoingContext(ctx)
	require.Empty(t, original.Get("authorization"))
	require.Empty(t, original.Get("temporal-namespace"))
}
