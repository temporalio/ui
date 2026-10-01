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
	"crypto/tls"
	"errors"
	"fmt"
)

// clientAuthMap maps string configuration values to supported TLS auth types.
var clientAuthMap = map[string]tls.ClientAuthType{
	"":                 tls.RequireAndVerifyClientCert,
	"requireAndVerify": tls.RequireAndVerifyClientCert,
	"verifyIfGiven":    tls.VerifyClientCertIfGiven,
	"request":          tls.RequestClientCert,
	"requireAny":       tls.RequireAnyClientCert,
}

type TLSMode int

const (
	ModeUnknown TLSMode = iota
	ModeNone
	ModeStandard
	ModeMutual
)

func (m TLSMode) String() string {
	switch m {
	case ModeNone:
		return "none"
	case ModeStandard:
		return "standard"
	case ModeMutual:
		return "mutual"
	case ModeUnknown:
		return "unknown"
	default:
		return fmt.Sprintf("TLSMode(%d)", int(m))
	}
}

// Validate checks the UI server's inbound TLS configuration.
func (t UIServerTLS) Validate() error {
	if (t.CertFile == "") != (t.KeyFile == "") {
		return errors.New("uiServerTLS.certFile and uiServerTLS.keyFile must both be set or both unset")
	}

	// rest of validation is related to mTLS, can return early if unset
	if t.MTLS == nil {
		return nil
	}

	if t.CertFile == "" || t.KeyFile == "" {
		return errors.New("mTLS requires both uiServerTLS.certFile and uiServerTLS.keyFile be set")
	}

	if t.MTLS.CaFile == "" {
		return errors.New("uiServerTLS.mTLS.caFile is required")
	}

	if _, err := t.MTLS.ClientAuthType(); err != nil {
		return err
	}

	return nil
}

// Mode determines the intended TLSMode from the config, provided a valid configuration is provided.
func (m UIServerTLS) Mode() (TLSMode, error) {
	// technically this should have already been called beforehand. However, it's a cheap enough call to make
	// again to protect us from subtle refactor bugs.
	if err := m.Validate(); err != nil {
		return ModeUnknown, err
	}

	if m.CertFile == "" && m.KeyFile == "" && m.MTLS == nil {
		return ModeNone, nil
	}

	if m.MTLS == nil {
		return ModeStandard, nil
	}

	return ModeMutual, nil
}

// ClientAuthType returns the tls.ClientAuthType for the configured ClientAuth string, or an error
// if the value is not recognized.
func (m UIServerMTLS) ClientAuthType() (tls.ClientAuthType, error) {
	v, ok := clientAuthMap[m.ClientAuth]
	if !ok {
		return 0, fmt.Errorf("invalid uiServerTLS.mTLS.clientAuth %q", m.ClientAuth)
	}
	return v, nil
}
