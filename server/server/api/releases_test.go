package api

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestReleaseServer(t *testing.T, tags map[string]string, calls *atomic.Int32) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		for repo, tag := range tags {
			if r.URL.Path == fmt.Sprintf("/repos/%s/releases/latest", repo) {
				fmt.Fprintf(w, `{"tag_name":%q}`, tag)
				return
			}
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	t.Cleanup(server.Close)
	return server
}

func TestReleaseCheckerNormalizesTags(t *testing.T) {
	var calls atomic.Int32
	server := newTestReleaseServer(t, map[string]string{
		"temporalio/cli":         "v1.9.1",
		"temporalio/helm-charts": "temporal-1.7.0",
		"temporalio/ui":          "v2.54.1",
		"temporalio/temporal":    "v1.32.0",
	}, &calls)
	checker := newReleaseChecker(server.URL, server.Client(), time.Now)

	for component, want := range map[string]string{
		ReleaseCLI:    "1.9.1",
		ReleaseHelm:   "1.7.0",
		ReleaseUI:     "2.54.1",
		ReleaseServer: "1.32.0",
	} {
		got, err := checker.Latest(context.Background(), component)
		require.NoError(t, err)
		assert.Equal(t, want, got, component)
	}
}

func TestReleaseCheckerCachesResults(t *testing.T) {
	var calls atomic.Int32
	server := newTestReleaseServer(t, map[string]string{"temporalio/cli": "v1.9.1"}, &calls)
	now := time.Now()
	checker := newReleaseChecker(server.URL, server.Client(), func() time.Time { return now })

	_, err := checker.Latest(context.Background(), ReleaseCLI)
	require.NoError(t, err)
	_, err = checker.Latest(context.Background(), ReleaseCLI)
	require.NoError(t, err)
	assert.Equal(t, int32(1), calls.Load())

	now = now.Add(releaseCacheTTL + time.Minute)
	_, err = checker.Latest(context.Background(), ReleaseCLI)
	require.NoError(t, err)
	assert.Equal(t, int32(2), calls.Load())
}

func TestReleaseCheckerCachesFailuresBriefly(t *testing.T) {
	var calls atomic.Int32
	server := newTestReleaseServer(t, map[string]string{}, &calls)
	now := time.Now()
	checker := newReleaseChecker(server.URL, server.Client(), func() time.Time { return now })

	_, err := checker.Latest(context.Background(), ReleaseCLI)
	require.Error(t, err)
	_, err = checker.Latest(context.Background(), ReleaseCLI)
	require.Error(t, err)
	assert.Equal(t, int32(1), calls.Load())

	now = now.Add(releaseFailureCacheTTL + time.Minute)
	_, _ = checker.Latest(context.Background(), ReleaseCLI)
	assert.Equal(t, int32(2), calls.Load())
}

func TestReleasesForDistribution(t *testing.T) {
	assert.Equal(t, []string{ReleaseCLI}, ReleasesForDistribution("cli"))
	assert.Equal(t, []string{ReleaseUI, ReleaseServer}, ReleasesForDistribution("docker"))
	assert.Equal(t, []string{ReleaseHelm, ReleaseUI, ReleaseServer}, ReleasesForDistribution("helm"))
	assert.Equal(t, []string{ReleaseServer}, ReleasesForDistribution(""))
	assert.Equal(t, []string{ReleaseServer}, ReleasesForDistribution("nix"))
}
