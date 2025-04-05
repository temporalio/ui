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

	cfgRefresh := &ConfigProviderWithRefresh{
		cache:           cfg,
		provider:        cfgProvider,
		refreshInterval: cfg.RefreshInterval,
	}
	cfgRefresh.initialize()

	return cfgRefresh, nil
}

type ConfigProviderWithRefresh struct {
	sync.RWMutex

	cache           *Config
	provider        ConfigProvider
	refreshInterval time.Duration

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
			break
		case <-s.ticker.C:
		}

		newConfig, err := s.provider.GetConfig()
		if err != nil {
			log.Printf("unable to load new UI server configuration: %s", err)
			continue
		}

		log.Printf("loaded new UI server configuration")
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
