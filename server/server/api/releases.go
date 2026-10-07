package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/Masterminds/semver/v3"
	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/config"
)

const (
	releaseCacheTTL        = 24 * time.Hour
	releaseFailureCacheTTL = time.Hour
	releaseRequestTimeout  = 5 * time.Second
	defaultGitHubAPIURL    = "https://api.github.com"
	defaultRegistryAPIURL  = "https://hub.docker.com"
	releaseListPageSize    = 100
)

// Release components that an install can be asked to upgrade.
const (
	ReleaseCLI   = "cli"
	ReleaseImage = "image"
	ReleaseUI    = "ui"
)

// GitHub repositories whose releases name a component's latest version.
var releaseRepos = map[string]string{
	ReleaseCLI: "temporalio/cli",
	ReleaseUI:  "temporalio/ui",
}

// Image tags that name a release. Floating tags such as "latest" and any
// commit-sha tags are not versions a user can be told to move to.
var imageVersionTag = regexp.MustCompile(`^\d+\.\d+\.\d+$`)

// Container repositories whose tags name a component's latest version.
var releaseImages = map[string]string{
	ReleaseImage: "temporalio/ui",
}

// The release that each distribution is upgraded to. Docker and Helm both
// install the published image, so they track its tags rather than the
// temporalio/ui release the image is built from.
var distributionReleases = map[string]string{
	"cli":    ReleaseCLI,
	"docker": ReleaseImage,
	"helm":   ReleaseImage,
	"server": ReleaseUI,
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
	client      *http.Client
	baseURL     string
	registryURL string
	now         func() time.Time

	mu    sync.Mutex
	cache map[string]releaseCacheEntry
}

// NewReleaseChecker creates a ReleaseChecker that queries the GitHub API.
func NewReleaseChecker() *ReleaseChecker {
	client := &http.Client{Timeout: releaseRequestTimeout}
	return newReleaseChecker(defaultGitHubAPIURL, defaultRegistryAPIURL, client, time.Now)
}

func newReleaseChecker(baseURL, registryURL string, client *http.Client, now func() time.Time) *ReleaseChecker {
	return &ReleaseChecker{
		client:      client,
		baseURL:     baseURL,
		registryURL: registryURL,
		now:         now,
		cache:       map[string]releaseCacheEntry{},
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
// leading "v".
func (rc *ReleaseChecker) Latest(ctx context.Context, component string) (string, error) {
	var key string
	var fetch func(context.Context) (string, error)

	switch {
	case releaseRepos[component] != "":
		repo := releaseRepos[component]
		key = "github:" + repo
		fetch = func(ctx context.Context) (string, error) { return rc.fetchLatestRelease(ctx, repo) }
	case releaseImages[component] != "":
		image := releaseImages[component]
		key = "image:" + image
		fetch = func(ctx context.Context) (string, error) { return rc.fetchLatestImageTag(ctx, image) }
	default:
		return "", fmt.Errorf("unknown release component %q", component)
	}

	rc.mu.Lock()
	entry, cached := rc.cache[key]
	rc.mu.Unlock()
	if cached && rc.isFresh(entry) {
		return entry.version, entry.err
	}

	version, err := fetch(ctx)
	rc.mu.Lock()
	rc.cache[key] = releaseCacheEntry{version: version, err: err, fetchedAt: rc.now()}
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

func (rc *ReleaseChecker) fetchLatestRelease(ctx context.Context, repo string) (string, error) {
	url := fmt.Sprintf("%s/repos/%s/releases/latest", rc.baseURL, repo)
	body, err := rc.get(ctx, url, "application/vnd.github+json", fmt.Sprintf("latest release of %s", repo))
	if err != nil {
		return "", err
	}
	defer body.Close()

	var release struct {
		TagName string `json:"tag_name"`
	}
	if err := json.NewDecoder(body).Decode(&release); err != nil {
		return "", err
	}
	version := normalizeReleaseTag(release.TagName)
	if version == "" {
		return "", fmt.Errorf("latest release of %s has no tag", repo)
	}
	return version, nil
}

// fetchLatestImageTag returns the highest version tag published for an image.
// The registry orders tags by push time, and a patch to an older line can be
// pushed after a newer minor, so the tags are compared rather than trusted in
// the order they arrive.
func (rc *ReleaseChecker) fetchLatestImageTag(ctx context.Context, image string) (string, error) {
	url := fmt.Sprintf("%s/v2/repositories/%s/tags?page_size=%d", rc.registryURL, image, releaseListPageSize)
	body, err := rc.get(ctx, url, "application/json", fmt.Sprintf("tags of %s", image))
	if err != nil {
		return "", err
	}
	defer body.Close()

	var page struct {
		Results []struct {
			Name string `json:"name"`
		} `json:"results"`
	}
	if err := json.NewDecoder(body).Decode(&page); err != nil {
		return "", err
	}

	latest := ""
	for _, tag := range page.Results {
		if !imageVersionTag.MatchString(tag.Name) {
			continue
		}
		if latest == "" || newerVersion(tag.Name, latest) {
			latest = tag.Name
		}
	}
	if latest == "" {
		return "", fmt.Errorf("no version tag published for %s", image)
	}
	return latest, nil
}

func (rc *ReleaseChecker) get(ctx context.Context, url, accept, what string) (io.ReadCloser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", accept)

	resp, err := rc.client.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("%s: unexpected status %d", what, resp.StatusCode)
	}
	return resp.Body, nil
}

func newerVersion(candidate, current string) bool {
	c, err := semver.NewVersion(candidate)
	if err != nil {
		return false
	}
	base, err := semver.NewVersion(current)
	if err != nil {
		return true
	}
	return c.GreaterThan(base)
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
