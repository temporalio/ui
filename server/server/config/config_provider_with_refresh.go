// The MIT License
//
// Copyright (c) 2022 Temporal Technologies Inc.  All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

package config

import (
	"log"
	"sync"
	"time"
)

func NewConfigProviderWithRefresh(cfgProvider ConfigProvider) (*ConfigProviderWithRefresh, error) {
	cfg, err := cfgProvider.GetConfig()
	if err != nil {
		return nil, err
	}

	// A bad typesafe block stops the startup.
	if err := cfg.ValidateTypeSafe(); err != nil {
		return nil, err
	}

	cfgRefresh := &ConfigProviderWithRefresh{
		cache:           cfg,
		provider:        cfgProvider,
		refreshInterval: cfg.RefreshInterval,
	}
	cfgRefresh.warnAboutTypeSafeLimits(cfg)
	cfgRefresh.initialize()

	return cfgRefresh, nil
}

type ConfigProviderWithRefresh struct {
	sync.RWMutex

	cache           *Config
	provider        ConfigProvider
	refreshInterval time.Duration

	// typeSafeInvalid and typeSafeProblem are the validation result of the most recent
	// reload. Only the refresh goroutine uses them. They make the log say each change one time.
	typeSafeInvalid bool
	typeSafeProblem string
	// typeSafeLimitWarned says that the log has the warning about the deployment limit.
	typeSafeLimitWarned bool

	ticker *time.Ticker
	stop   chan bool
}

func (r *ConfigProviderWithRefresh) GetConfig() (*Config, error) {
	r.RLock()
	defer r.RUnlock()
	return r.cache, nil
}

func (s *ConfigProviderWithRefresh) initialize() {
	if s.refreshInterval != 0 {
		s.stop = make(chan bool)
		s.ticker = time.NewTicker(s.refreshInterval)
		go s.refreshConfig()
	}
}

func (s *ConfigProviderWithRefresh) refreshConfig() {
	for {
		select {
		case <-s.stop:
			// A break here leaves only the select: the loop then spins on the closed channel.
			s.ticker.Stop()
			return
		case <-s.ticker.C:
		}

		newConfig, err := s.provider.GetConfig()
		if err != nil {
			log.Printf("unable to load new UI server configuration: %s", err)
			continue
		}

		log.Printf("loaded new UI server configuration")
		newConfig = s.withValidTypeSafe(newConfig)
		s.Lock()
		s.cache = newConfig
		s.Unlock()
	}
}

func (s *ConfigProviderWithRefresh) Close() {
	if s.ticker != nil {
		s.ticker.Stop()
	}
	if s.stop != nil {
		s.stop <- true
		close(s.stop)
	}
}

// withValidTypeSafe keeps a bad typesafe block from a reload away from the server. The
// features share the block, so it turns ALL of them off in a copy, and does not
// change the config of the provider. It logs when the state changes, not on each tick.
func (s *ConfigProviderWithRefresh) withValidTypeSafe(cfg *Config) *Config {
	err := cfg.ValidateTypeSafe()
	invalid := err != nil
	problem := ""
	if invalid {
		problem = err.Error()
	}

	s.warnAboutTypeSafeLimits(cfg)

	switch {
	case invalid && (!s.typeSafeInvalid || problem != s.typeSafeProblem):
		log.Printf("natural-language search and history review are off because the typesafe configuration is not valid: %s", problem)
	case !invalid && s.typeSafeInvalid:
		log.Printf("the typesafe configuration is valid again")
	}
	s.typeSafeInvalid = invalid
	s.typeSafeProblem = problem

	if !invalid {
		return cfg
	}
	safe := *cfg
	safe.NLSearch.Enabled = false
	safe.HistoryReview.Enabled = false
	return &safe
}

// warnAboutTypeSafeLimits logs one warning, at startup or at a reload, when the limit
// for all callers together is below the limit for one caller. That config is valid,
// but one caller can then use the full quota of the deployment.
func (s *ConfigProviderWithRefresh) warnAboutTypeSafeLimits(cfg *Config) {
	rateLimit := cfg.TypeSafe.RateLimit.WithDefaults()
	inverted := cfg.UsesTypeSafe() && !rateLimit.Disabled &&
		rateLimit.DeploymentRequestsPerMinute < rateLimit.RequestsPerMinute

	if inverted && !s.typeSafeLimitWarned {
		log.Printf("warning: typesafe.rateLimit.deploymentRequestsPerMinute (%d) is below requestsPerMinute (%d): one caller can use the full quota of the deployment",
			rateLimit.DeploymentRequestsPerMinute, rateLimit.RequestsPerMinute)
	}
	s.typeSafeLimitWarned = inverted
}
