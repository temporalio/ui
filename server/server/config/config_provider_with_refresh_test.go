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
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

type countingConfigProvider struct {
	calls atomic.Int64
	cfg   *Config
}

func (p *countingConfigProvider) GetConfig() (*Config, error) {
	p.calls.Add(1)
	return p.cfg, nil
}

func TestConfigProviderWithRefresh_StopsRefreshingAfterClose(t *testing.T) {
	provider := &countingConfigProvider{cfg: &Config{RefreshInterval: 10 * time.Millisecond}}

	refresh, err := NewConfigProviderWithRefresh(provider)
	require.NoError(t, err)

	// Wait until the background refresh has run at least once.
	require.Eventually(t, func() bool { return provider.calls.Load() > 1 }, 5*time.Second, 5*time.Millisecond)

	refresh.Close()

	// Allow a refresh that was already in flight to finish, then confirm that
	// no further refreshes happen.
	time.Sleep(50 * time.Millisecond)
	callsAfterClose := provider.calls.Load()
	time.Sleep(200 * time.Millisecond)
	require.Equal(t, callsAfterClose, provider.calls.Load(), "config refreshed after Close")
}
