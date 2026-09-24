package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/config"
)

const (
	releaseCacheTTL        = 24 * time.Hour
	releaseFailureCacheTTL = time.Hour
	releaseRequestTimeout  = 5 * time.Second
	defaultGitHubAPIURL    = "https://api.github.com"
)

// Release components that an install can be asked to upgrade.
const (
	ReleaseCLI    = "cli"
	ReleaseHelm   = "helm"
	ReleaseUI     = "ui"
	ReleaseServer = "server"
)

var releaseRepos = map[string]string{
	ReleaseCLI:    "temporalio/cli",
	ReleaseHelm:   "temporalio/helm-charts",
	ReleaseUI:     "temporalio/ui",
	ReleaseServer: "temporalio/temporal",
}

// The release that each distribution is upgraded to.
var distributionReleases = map[string]string{
	"cli":    ReleaseCLI,
	"docker": ReleaseUI,
	"helm":   ReleaseHelm,
	"server": ReleaseServer,
}

// LatestReleasesResponse lists the latest published version of the
// release that this install's distribution is upgraded to.
type LatestReleasesResponse struct {
	Releases map[string]string
}

type releaseCacheEntry struct {
	version   string
	err       error
	fetchedAt time.Time
}

// ReleaseChecker looks up the latest GitHub release of Temporal components
// and caches the results.
type ReleaseChecker struct {
	client  *http.Client
	baseURL string
	now     func() time.Time

	mu    sync.Mutex
	cache map[string]releaseCacheEntry
}

// NewReleaseChecker creates a ReleaseChecker that queries the GitHub API.
func NewReleaseChecker() *ReleaseChecker {
	return newReleaseChecker(defaultGitHubAPIURL, &http.Client{Timeout: releaseRequestTimeout}, time.Now)
}

func newReleaseChecker(baseURL string, client *http.Client, now func() time.Time) *ReleaseChecker {
	return &ReleaseChecker{
		client:  client,
		baseURL: baseURL,
		now:     now,
		cache:   map[string]releaseCacheEntry{},
	}
}

// ReleaseForDistribution returns the release checked for a distribution.
// Unknown distributions are treated as a server built from source.
func ReleaseForDistribution(distribution string) string {
	if component, ok := distributionReleases[distribution]; ok {
		return component
	}
	return distributionReleases["server"]
}

// Latest returns the latest released version of a component, without a
// leading "v" or chart prefix.
func (rc *ReleaseChecker) Latest(ctx context.Context, component string) (string, error) {
	repo, ok := releaseRepos[component]
	if !ok {
		return "", fmt.Errorf("unknown release component %q", component)
	}

	rc.mu.Lock()
	entry, cached := rc.cache[repo]
	rc.mu.Unlock()
	if cached && rc.isFresh(entry) {
		return entry.version, entry.err
	}

	version, err := rc.fetchLatest(ctx, repo)
	rc.mu.Lock()
	rc.cache[repo] = releaseCacheEntry{version: version, err: err, fetchedAt: rc.now()}
	rc.mu.Unlock()
	return version, err
}

func (rc *ReleaseChecker) isFresh(entry releaseCacheEntry) bool {
	ttl := releaseCacheTTL
	if entry.err != nil {
		ttl = releaseFailureCacheTTL
	}
	return rc.now().Sub(entry.fetchedAt) < ttl
}

func (rc *ReleaseChecker) fetchLatest(ctx context.Context, repo string) (string, error) {
	url := fmt.Sprintf("%s/repos/%s/releases/latest", rc.baseURL, repo)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := rc.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("latest release of %s: unexpected status %d", repo, resp.StatusCode)
	}

	var release struct {
		TagName string `json:"tag_name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return "", err
	}
	version := normalizeReleaseTag(release.TagName)
	if version == "" {
		return "", fmt.Errorf("latest release of %s has no tag", repo)
	}
	return version, nil
}

func normalizeReleaseTag(tag string) string {
	tag = strings.TrimPrefix(tag, "temporal-")
	return strings.TrimPrefix(tag, "v")
}

// GetLatestReleases returns the latest release of the configured
// distribution. A failed lookup returns no releases.
func GetLatestReleases(cfgProvider *config.ConfigProviderWithRefresh, checker *ReleaseChecker) func(echo.Context) error {
	return func(c echo.Context) error {
		cfg, err := cfgProvider.GetConfig()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}

		response := &LatestReleasesResponse{Releases: map[string]string{}}
		if !cfg.NotifyOnNewVersion {
			return c.JSON(http.StatusOK, response)
		}

		component := ReleaseForDistribution(cfg.Distribution)
		if version, err := checker.Latest(c.Request().Context(), component); err == nil {
			response.Releases[component] = version
		}
		return c.JSON(http.StatusOK, response)
	}
}
