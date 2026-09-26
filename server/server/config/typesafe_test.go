package config

import (
	"bytes"
	"log"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type swappableProvider struct {
	mu  sync.Mutex
	cfg *Config
}

func (p *swappableProvider) GetConfig() (*Config, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.cfg, nil
}

func (p *swappableProvider) set(cfg *Config) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.cfg = cfg
}

// testConfig builds a config with the given typesafe block and both feature gates on.
func testConfig(typeSafe TypeSafe) *Config {
	return &Config{TypeSafe: typeSafe, NLSearch: NLSearch{Enabled: true}, HistoryReview: HistoryReview{Enabled: true}}
}

func TestTypeSafeValidate(t *testing.T) {
	tests := map[string]struct {
		cfg     TypeSafe
		unused  bool
		wantErr string
	}{
		"zero value, not in use":        {cfg: TypeSafe{}, unused: true},
		"defaults":                      {cfg: TypeSafe{APIKey: "k"}},
		"https URL":                     {cfg: TypeSafe{BaseURL: "https://api.typesafe.ai"}},
		"http URL":                      {cfg: TypeSafe{BaseURL: "http://localhost:9000"}},
		"a bad URL when not in use":     {cfg: TypeSafe{BaseURL: "not a url"}, unused: true},
		"zero rate selects the default": {cfg: TypeSafe{RateLimit: TypeSafeRateLimit{RequestsPerMinute: 0, Burst: 0}}},
		"escaped plus in the key":       {cfg: TypeSafe{APIKey: "abc&#43;def"}, wantErr: "typesafe.apiKey"},
		"escaped ampersand in the key":  {cfg: TypeSafe{APIKey: "a&amp;b"}, wantErr: "typesafe.apiKey"},
		"base64 key":                    {cfg: TypeSafe{APIKey: "abc/def+ghi=="}},
		"escaped key when not in use":   {cfg: TypeSafe{APIKey: "abc&#43;def"}, unused: true},
		"disabled rate limit":           {cfg: TypeSafe{RateLimit: TypeSafeRateLimit{Disabled: true}}},
		"no scheme":                     {cfg: TypeSafe{BaseURL: "api.typesafe.ai"}, wantErr: "typesafe.baseUrl"},
		"a bad scheme":                  {cfg: TypeSafe{BaseURL: "ftp://api.typesafe.ai"}, wantErr: "typesafe.baseUrl"},
		"no host":                       {cfg: TypeSafe{BaseURL: "https://"}, wantErr: "typesafe.baseUrl"},
		"negative deployment rate":      {cfg: TypeSafe{RateLimit: TypeSafeRateLimit{DeploymentRequestsPerMinute: -1}}, unused: true, wantErr: "deploymentRequestsPerMinute"},
		"negative requests a minute":    {cfg: TypeSafe{RateLimit: TypeSafeRateLimit{RequestsPerMinute: -1}}, unused: true, wantErr: "requestsPerMinute"},
		"negative burst":                {cfg: TypeSafe{RateLimit: TypeSafeRateLimit{Burst: -1}}, unused: true, wantErr: "burst"},
		"negative burst when in use":    {cfg: TypeSafe{RateLimit: TypeSafeRateLimit{Burst: -5}}, wantErr: "burst"},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			err := tt.cfg.Validate(!tt.unused)
			if tt.wantErr == "" {
				assert.NoError(t, err)
				return
			}
			require.Error(t, err)
			assert.Contains(t, err.Error(), tt.wantErr)
		})
	}
}

// Each gate alone puts the typesafe block in use.
func TestValidateTypeSafeFollowsEachFeatureGate(t *testing.T) {
	bad := TypeSafe{APIKey: "k", BaseURL: "nope"}

	assert.NoError(t, (&Config{TypeSafe: bad}).ValidateTypeSafe(), "no gate is on")
	assert.ErrorContains(t, (&Config{TypeSafe: bad, NLSearch: NLSearch{Enabled: true}}).ValidateTypeSafe(), "typesafe.baseUrl")
	assert.ErrorContains(t, (&Config{TypeSafe: bad, HistoryReview: HistoryReview{Enabled: true}}).ValidateTypeSafe(), "typesafe.baseUrl")
}

func TestFeatureGatesNeedAKey(t *testing.T) {
	tests := map[string]struct {
		cfg               Config
		wantNLSearch      bool
		wantHistoryReview bool
	}{
		"nothing":             {cfg: Config{}},
		"gates without a key": {cfg: Config{NLSearch: NLSearch{Enabled: true}, HistoryReview: HistoryReview{Enabled: true}}},
		"key without a gate":  {cfg: Config{TypeSafe: TypeSafe{APIKey: "k"}}},
		"only nl-search":      {cfg: Config{TypeSafe: TypeSafe{APIKey: "k"}, NLSearch: NLSearch{Enabled: true}}, wantNLSearch: true},
		"only history review": {cfg: Config{TypeSafe: TypeSafe{APIKey: "k"}, HistoryReview: HistoryReview{Enabled: true}}, wantHistoryReview: true},
		"both":                {cfg: *testConfig(TypeSafe{APIKey: "k"}), wantNLSearch: true, wantHistoryReview: true},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, tt.wantNLSearch, tt.cfg.NLSearchEnabled())
			assert.Equal(t, tt.wantHistoryReview, tt.cfg.HistoryReviewEnabled())
		})
	}
}

func TestTypeSafeWithDefaults(t *testing.T) {
	t.Run("a config with no values gets each default, and the rate limit is on", func(t *testing.T) {
		got := TypeSafe{APIKey: "k"}.WithDefaults()
		assert.Equal(t, TypeSafe{
			APIKey:  "k",
			Model:   "jev-latest",
			BaseURL: "https://api.typesafe.ai",
			Timeout: 5 * time.Second,
			RateLimit: TypeSafeRateLimit{
				Disabled:                    false,
				RequestsPerMinute:           30,
				Burst:                       10,
				DeploymentRequestsPerMinute: 300,
			},
		}, got)
	})

	t.Run("values stay", func(t *testing.T) {
		in := TypeSafe{
			Model: "jev-1.13", BaseURL: "http://localhost:1", Timeout: time.Second,
			RateLimit: TypeSafeRateLimit{Disabled: true, RequestsPerMinute: 5, Burst: 2, DeploymentRequestsPerMinute: 50},
		}
		assert.Equal(t, in, in.WithDefaults())
	})
}

func TestConfigValidateIncludesTypeSafe(t *testing.T) {
	cfg := testConfig(TypeSafe{BaseURL: "nope"})
	cfg.TemporalGRPCAddress = "127.0.0.1:7233"
	assert.ErrorContains(t, cfg.Validate(), "typesafe.baseUrl")
}

func TestBadTypeSafeConfigFailsAtStartup(t *testing.T) {
	provider := &swappableProvider{cfg: &Config{TypeSafe: TypeSafe{APIKey: "k", BaseURL: "nope"}, HistoryReview: HistoryReview{Enabled: true}}}

	cfgProvider, err := NewConfigProviderWithRefresh(provider)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "typesafe.baseUrl")
	assert.Nil(t, cfgProvider)
}

// The features share the typesafe block, so a bad block turns BOTH features off.
func TestBadTypeSafeConfigOnReloadTurnsBothFeaturesOff(t *testing.T) {
	good := testConfig(TypeSafe{APIKey: "k", BaseURL: "https://api.typesafe.ai"})
	good.RefreshInterval = 5 * time.Millisecond
	provider := &swappableProvider{cfg: good}

	logs := &lockedBuffer{}
	log.SetOutput(logs)
	defer log.SetOutput(os.Stderr)

	cfgProvider, err := NewConfigProviderWithRefresh(provider)
	require.NoError(t, err)
	defer cfgProvider.Close()

	bad := testConfig(TypeSafe{APIKey: "k", BaseURL: "nope"})
	bad.DefaultNamespace = "reloaded"
	provider.set(bad)

	require.Eventually(t, func() bool {
		cfg, err := cfgProvider.GetConfig()
		return err == nil && cfg.DefaultNamespace == "reloaded"
	}, 2*time.Second, 5*time.Millisecond, "the reload must apply, not crash")

	cfg, err := cfgProvider.GetConfig()
	require.NoError(t, err)
	assert.False(t, cfg.NLSearchEnabled())
	assert.False(t, cfg.HistoryReviewEnabled())
	assert.True(t, bad.NLSearch.Enabled, "the config of the provider must stay as it is")
	assert.True(t, bad.HistoryReview.Enabled, "the config of the provider must stay as it is")

	// The bad config stays for many ticks. The log says it one time.
	time.Sleep(50 * time.Millisecond)
	assert.Equal(t, 1, strings.Count(logs.String(), "are off because the typesafe configuration is not valid"), logs.String())

	// A later good config turns the features on again.
	fixed := testConfig(good.TypeSafe)
	provider.set(fixed)
	require.Eventually(t, func() bool {
		cfg, err := cfgProvider.GetConfig()
		return err == nil && cfg.NLSearchEnabled() && cfg.HistoryReviewEnabled()
	}, 2*time.Second, 5*time.Millisecond)
	assert.Equal(t, 1, strings.Count(logs.String(), "valid again"), logs.String())
}

type lockedBuffer struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func (b *lockedBuffer) Write(p []byte) (int, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buf.Write(p)
}

func (b *lockedBuffer) String() string {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buf.String()
}

type countingProvider struct {
	cfg   *Config
	calls atomic.Int64
}

func (p *countingProvider) GetConfig() (*Config, error) {
	p.calls.Add(1)
	return p.cfg, nil
}

// After Close, the refresh goroutine must exit. Before the fix it looped on the
// closed stop channel: it called the provider and wrote a log line without a pause.
func TestRefreshGoroutineExitsAfterClose(t *testing.T) {
	logs := &lockedBuffer{}
	log.SetOutput(logs)
	defer log.SetOutput(os.Stderr)

	provider := &countingProvider{cfg: &Config{RefreshInterval: 2 * time.Millisecond}}
	cfgProvider, err := NewConfigProviderWithRefresh(provider)
	require.NoError(t, err)

	require.Eventually(t, func() bool { return provider.calls.Load() >= 3 }, 2*time.Second, time.Millisecond, "the refresh must run before Close")

	cfgProvider.Close()
	// One reload can be in progress at the time of Close.
	time.Sleep(20 * time.Millisecond)
	afterClose := provider.calls.Load()
	logLength := len(logs.String())

	time.Sleep(100 * time.Millisecond)
	assert.Equal(t, afterClose, provider.calls.Load(), "no provider call after Close")
	assert.Equal(t, logLength, len(logs.String()), "no log line after Close")
}

func TestCloseWithoutRefreshInterval(t *testing.T) {
	cfgProvider, err := NewConfigProviderWithRefresh(&countingProvider{cfg: &Config{}})
	require.NoError(t, err)
	assert.NotPanics(t, cfgProvider.Close)
}

func TestRateLimitWithDefaults(t *testing.T) {
	assert.Equal(t,
		TypeSafeRateLimit{RequestsPerMinute: 30, Burst: 10, DeploymentRequestsPerMinute: 300},
		TypeSafeRateLimit{}.WithDefaults(),
	)
	assert.Equal(t,
		TypeSafeRateLimit{Disabled: true, RequestsPerMinute: 30, Burst: 10, DeploymentRequestsPerMinute: 300},
		TypeSafeRateLimit{Disabled: true}.WithDefaults(),
		"Disabled stays, and it is the only way to turn the limit off",
	)
	custom := TypeSafeRateLimit{RequestsPerMinute: 5, Burst: 2, DeploymentRequestsPerMinute: 50}
	assert.Equal(t, custom, custom.WithDefaults())
}

func TestWarningWhenTheDeploymentLimitIsBelowTheCallerLimit(t *testing.T) {
	const warning = "deploymentRequestsPerMinute (20) is below requestsPerMinute (30)"
	inverted := TypeSafe{APIKey: "k", RateLimit: TypeSafeRateLimit{DeploymentRequestsPerMinute: 20}}

	t.Run("at startup, with one gate on", func(t *testing.T) {
		logs := &lockedBuffer{}
		log.SetOutput(logs)
		defer log.SetOutput(os.Stderr)

		cfg := &Config{TypeSafe: inverted, HistoryReview: HistoryReview{Enabled: true}}
		cfgProvider, err := NewConfigProviderWithRefresh(&swappableProvider{cfg: cfg})
		require.NoError(t, err, "the config is valid: the warning does not stop the startup")
		defer cfgProvider.Close()
		assert.Equal(t, 1, strings.Count(logs.String(), warning), logs.String())
	})

	t.Run("no warning for the defaults, a disabled limit, or no gate", func(t *testing.T) {
		logs := &lockedBuffer{}
		log.SetOutput(logs)
		defer log.SetOutput(os.Stderr)

		noLimit := inverted
		noLimit.RateLimit.Disabled = true
		for _, cfg := range []*Config{testConfig(TypeSafe{APIKey: "k"}), {TypeSafe: inverted}, testConfig(noLimit)} {
			cfgProvider, err := NewConfigProviderWithRefresh(&swappableProvider{cfg: cfg})
			require.NoError(t, err)
			cfgProvider.Close()
		}
		assert.NotContains(t, logs.String(), "is below requestsPerMinute")
	})

	t.Run("one time at a reload", func(t *testing.T) {
		logs := &lockedBuffer{}
		log.SetOutput(logs)
		defer log.SetOutput(os.Stderr)

		first := testConfig(TypeSafe{APIKey: "k"})
		first.RefreshInterval = 2 * time.Millisecond
		provider := &swappableProvider{cfg: first}
		cfgProvider, err := NewConfigProviderWithRefresh(provider)
		require.NoError(t, err)
		defer cfgProvider.Close()

		provider.set(testConfig(inverted))
		require.Eventually(t, func() bool { return strings.Contains(logs.String(), warning) }, 2*time.Second, 2*time.Millisecond)
		time.Sleep(30 * time.Millisecond)
		assert.Equal(t, 1, strings.Count(logs.String(), warning), "many ticks, one warning")
	})
}
