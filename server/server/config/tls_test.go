// The MIT License
//
// Copyright (c) 2026 Temporal Technologies Inc.  All rights reserved.
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
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUIServerMTLS_ClientAuthType(t *testing.T) {
	cases := map[string]tls.ClientAuthType{
		"":                 tls.RequireAndVerifyClientCert,
		"requireAndVerify": tls.RequireAndVerifyClientCert,
		"verifyIfGiven":    tls.VerifyClientCertIfGiven,
		"request":          tls.RequestClientCert,
		"requireAny":       tls.RequireAnyClientCert,
	}
	for in, want := range cases {
		got, err := UIServerMTLS{ClientAuth: in}.ClientAuthType()
		assert.NoError(t, err, "input=%q", in)
		assert.Equal(t, want, got, "input=%q", in)
	}

	_, err := UIServerMTLS{ClientAuth: "bogus"}.ClientAuthType()
	assert.Error(t, err)
}

func TestUIServerTLS_Validate(t *testing.T) {
	tests := []struct {
		name    string
		cfg     UIServerTLS
		wantErr string
	}{
		{
			name: "empty is valid",
			cfg:  UIServerTLS{},
		},
		{
			name: "cert and key together is valid",
			cfg:  UIServerTLS{CertFile: "c", KeyFile: "k"},
		},
		{
			name:    "cert without key errors",
			cfg:     UIServerTLS{CertFile: "c"},
			wantErr: "must both be set or both unset",
		},
		{
			name:    "key without cert errors",
			cfg:     UIServerTLS{KeyFile: "k"},
			wantErr: "must both be set or both unset",
		},
		{
			name: "mTLS with cert, key, and CA is valid",
			cfg: UIServerTLS{
				CertFile: "c",
				KeyFile:  "k",
				MTLS:     &UIServerMTLS{CaFile: "ca"},
			},
		},
		{
			name: "mTLS without cert/key errors",
			cfg: UIServerTLS{
				MTLS: &UIServerMTLS{CaFile: "ca"},
			},
			wantErr: "mTLS requires",
		},
		{
			name: "mTLS without CA errors",
			cfg: UIServerTLS{
				CertFile: "c",
				KeyFile:  "k",
				MTLS:     &UIServerMTLS{},
			},
			wantErr: "caFile is required",
		},
		{
			name: "mTLS with unknown clientAuth errors",
			cfg: UIServerTLS{
				CertFile: "c",
				KeyFile:  "k",
				MTLS:     &UIServerMTLS{CaFile: "ca", ClientAuth: "nope"},
			},
			wantErr: "invalid uiServerTLS.mTLS.clientAuth",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.cfg.Validate()
			if tc.wantErr == "" {
				assert.NoError(t, err)
			} else {
				assert.ErrorContains(t, err, tc.wantErr)
			}
		})
	}
}

func TestUIServerTLS_Mode(t *testing.T) {
	tests := []struct {
		name     string
		cfg      UIServerTLS
		wantMode TLSMode
		wantErr  bool
	}{
		{
			name:     "empty config returns ModeNone",
			cfg:      UIServerTLS{},
			wantMode: ModeNone,
		},
		{
			name:     "cert and key returns ModeStandard",
			cfg:      UIServerTLS{CertFile: "c", KeyFile: "k"},
			wantMode: ModeStandard,
		},
		{
			name: "cert, key, and mTLS returns ModeMutual",
			cfg: UIServerTLS{
				CertFile: "c",
				KeyFile:  "k",
				MTLS:     &UIServerMTLS{CaFile: "ca"},
			},
			wantMode: ModeMutual,
		},
		{
			name:     "cert without key returns ModeUnknown with error",
			cfg:      UIServerTLS{CertFile: "c"},
			wantMode: ModeUnknown,
			wantErr:  true,
		},
		{
			name: "mTLS without CA returns ModeUnknown with error",
			cfg: UIServerTLS{
				CertFile: "c",
				KeyFile:  "k",
				MTLS:     &UIServerMTLS{},
			},
			wantMode: ModeUnknown,
			wantErr:  true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := tc.cfg.Mode()
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.wantMode, got)
		})
	}
}
