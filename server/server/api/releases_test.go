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
			// Components with a tag pattern list releases instead.
			if r.URL.Path == fmt.Sprintf("/repos/%s/releases", repo) {
				fmt.Fprintf(w, `[{"tag_name":%q}]`, tag)
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
		"temporalio/cli": "v1.9.1",
		"temporalio/ui":  "v2.54.1",
	}, &calls)
	checker := newReleaseChecker(server.URL, server.URL, server.Client(), time.Now)

	for component, want := range map[string]string{
		ReleaseCLI: "1.9.1",
		ReleaseUI:  "2.54.1",
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
	checker := newReleaseChecker(server.URL, server.URL, server.Client(), func() time.Time { return now })

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
	checker := newReleaseChecker(server.URL, server.URL, server.Client(), func() time.Time { return now })

	_, err := checker.Latest(context.Background(), ReleaseCLI)
	require.Error(t, err)
	_, err = checker.Latest(context.Background(), ReleaseCLI)
	require.Error(t, err)
	assert.Equal(t, int32(1), calls.Load())

	now = now.Add(releaseFailureCacheTTL + time.Minute)
	_, _ = checker.Latest(context.Background(), ReleaseCLI)
	assert.Equal(t, int32(2), calls.Load())
}

func TestReleaseCheckerTakesTheHighestImageTag(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v2/repositories/temporalio/ui/tags" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		// Ordered by push time, as the registry returns them: 2.50.1 was
		// published after 2.51.1, and "latest" is not a version.
		fmt.Fprint(w, `{"results":[
			{"name":"latest"},
			{"name":"2.50.1"},
			{"name":"2.51.1"},
			{"name":"2.49.0"}
		]}`)
	}))
	t.Cleanup(server.Close)
	checker := newReleaseChecker(server.URL, server.URL, server.Client(), time.Now)

	got, err := checker.Latest(context.Background(), ReleaseImage)
	require.NoError(t, err)
	assert.Equal(t, "2.51.1", got)
}

func TestReleaseCheckerErrorsWhenImageHasNoVersionTag(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"results":[{"name":"latest"},{"name":"sha-abc1234"}]}`)
	}))
	t.Cleanup(server.Close)
	checker := newReleaseChecker(server.URL, server.URL, server.Client(), time.Now)

	_, err := checker.Latest(context.Background(), ReleaseImage)
	require.Error(t, err)
}

func TestReleaseForDistributionTracksTheInstalledArtifact(t *testing.T) {
	assert.Equal(t, ReleaseCLI, ReleaseForDistribution("cli"))
	assert.Equal(t, ReleaseImage, ReleaseForDistribution("docker"))
	assert.Equal(t, ReleaseImage, ReleaseForDistribution("helm"))
	assert.Equal(t, ReleaseUI, ReleaseForDistribution("server"))
	assert.Equal(t, ReleaseUI, ReleaseForDistribution(""))
	assert.Equal(t, ReleaseUI, ReleaseForDistribution("nix"))
}
