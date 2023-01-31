// The MIT License
//
// Copyright (c) 2020 Temporal Technologies Inc.  All rights reserved.
//
// Copyright (c) 2020 Uber Technologies, Inc.
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
	"errors"
)

// Validate validates the persistence config
func (c *Auth) Validate() error {
	if c == nil {
		return nil
	}

	if !c.Enabled {
		return nil
	}

	for _, p := range c.Providers {
		if err := p.validate(); err != nil {
			return err
		}
	}

	return nil
}

func (c *AuthProvider) validate() error {
	if c == nil {
		return nil
	}

	if c.ProviderURL == "" {
		return errors.New("auth provider url is not")
	}

	if c.ClientID == "" {
		return errors.New("auth client id is not set")
	}

	if c.CallbackURL == "" {
		return errors.New("auth callback url is not set")
	}

	return nil
}
