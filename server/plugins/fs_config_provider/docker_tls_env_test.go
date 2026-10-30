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

package fs_config_provider

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"github.com/temporalio/ui-server/v2/server/config"
)

const dockerConfigDir = "../../config"

type (
	DockerTLSEnvSuite struct {
		*require.Assertions
		suite.Suite
	}
)

func TestDockerTLSEnvSuite(t *testing.T) {
	suite.Run(t, new(DockerTLSEnvSuite))
}

func (s *DockerTLSEnvSuite) SetupTest() {
	s.Assertions = require.New(s.T())
}

// TestLegacyNames verifies the pre-existing, non-standard TEMPORAL_TLS_* env
// vars still populate the TLS config (back-compat).
func (s *DockerTLSEnvSuite) TestLegacyNames() {
	s.T().Setenv("TEMPORAL_TLS_CA", "/legacy/ca.pem")
	s.T().Setenv("TEMPORAL_TLS_CERT", "/legacy/cert.pem")
	s.T().Setenv("TEMPORAL_TLS_KEY", "/legacy/key.pem")
	s.T().Setenv("TEMPORAL_TLS_ENABLE_HOST_VERIFICATION", "true")

	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.Equal("/legacy/ca.pem", cfg.TLS.CaFile)
	s.Equal("/legacy/cert.pem", cfg.TLS.CertFile)
	s.Equal("/legacy/key.pem", cfg.TLS.KeyFile)
	s.True(cfg.TLS.EnableHostVerification)
}

// TestStandardEnvconfigNames verifies the standard envconfig names shared by
// the temporal CLI and SDKs are also accepted.
func (s *DockerTLSEnvSuite) TestStandardEnvconfigNames() {
	s.T().Setenv("TEMPORAL_TLS_SERVER_CA_CERT_PATH", "/standard/ca.pem")
	s.T().Setenv("TEMPORAL_TLS_CLIENT_CERT_PATH", "/standard/cert.pem")
	s.T().Setenv("TEMPORAL_TLS_CLIENT_KEY_PATH", "/standard/key.pem")
	s.T().Setenv("TEMPORAL_TLS_DISABLE_HOST_VERIFICATION", "false")

	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.Equal("/standard/ca.pem", cfg.TLS.CaFile)
	s.Equal("/standard/cert.pem", cfg.TLS.CertFile)
	s.Equal("/standard/key.pem", cfg.TLS.KeyFile)
	s.True(cfg.TLS.EnableHostVerification)
}

// TestStandardEnvconfigDataNames verifies the standard *_DATA env vars are
// accepted for the base64-encoded PEM variants.
func (s *DockerTLSEnvSuite) TestStandardEnvconfigDataNames() {
	s.T().Setenv("TEMPORAL_TLS_SERVER_CA_CERT_DATA", "ca-data")
	s.T().Setenv("TEMPORAL_TLS_CLIENT_CERT_DATA", "cert-data")
	s.T().Setenv("TEMPORAL_TLS_CLIENT_KEY_DATA", "key-data")

	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.Equal("ca-data", cfg.TLS.CaData)
	s.Equal("cert-data", cfg.TLS.CertData)
	s.Equal("key-data", cfg.TLS.KeyData)
}

// TestDisableHostVerificationInverted verifies TEMPORAL_TLS_DISABLE_HOST_VERIFICATION
// is correctly inverted into EnableHostVerification in both directions.
func (s *DockerTLSEnvSuite) TestDisableHostVerificationInverted() {
	s.T().Setenv("TEMPORAL_TLS_DISABLE_HOST_VERIFICATION", "true")

	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.False(cfg.TLS.EnableHostVerification)
}

func (s *DockerTLSEnvSuite) TestDisableHostVerificationFalseEnablesHostVerification() {
	s.T().Setenv("TEMPORAL_TLS_DISABLE_HOST_VERIFICATION", "false")

	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.True(cfg.TLS.EnableHostVerification)
}

// TestStandardNamesTakePrecedence verifies that when both the standard and
// legacy names are set, the standard envconfig name wins.
func (s *DockerTLSEnvSuite) TestStandardNamesTakePrecedence() {
	s.T().Setenv("TEMPORAL_TLS_CA", "/legacy/ca.pem")
	s.T().Setenv("TEMPORAL_TLS_SERVER_CA_CERT_PATH", "/standard/ca.pem")
	s.T().Setenv("TEMPORAL_TLS_ENABLE_HOST_VERIFICATION", "true")
	s.T().Setenv("TEMPORAL_TLS_DISABLE_HOST_VERIFICATION", "true")

	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.Equal("/standard/ca.pem", cfg.TLS.CaFile)
	s.False(cfg.TLS.EnableHostVerification)
}

// TestNoTLSEnvVarsSet verifies the default (no TLS configured) case is
// unaffected.
func (s *DockerTLSEnvSuite) TestNoTLSEnvVarsSet() {
	var cfg config.Config
	s.NoError(Load(dockerConfigDir, &cfg, "docker"))

	s.Empty(cfg.TLS.CaFile)
	s.Empty(cfg.TLS.CertFile)
	s.Empty(cfg.TLS.KeyFile)
	s.False(cfg.TLS.EnableHostVerification)
}
