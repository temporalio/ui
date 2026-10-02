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

package server

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/temporalio/ui-server/v2/server/config"
)

func TestBuildMTLSConfig(t *testing.T) {
	dir := t.TempDir()
	certPath := filepath.Join(dir, "server.crt")
	keyPath := filepath.Join(dir, "server.key")
	caPath := filepath.Join(dir, "ca.crt")

	certPEM, keyPEM := generateTLSKeyPair(t, "ui-server")
	require.NoError(t, os.WriteFile(certPath, certPEM, 0644))
	require.NoError(t, os.WriteFile(keyPath, keyPEM, 0644))
	require.NoError(t, os.WriteFile(caPath, certPEM, 0644))

	tlsCfg, err := buildMTLSConfig(certPath, keyPath, config.UIServerMTLS{
		CaFile: caPath,
	})
	require.NoError(t, err)
	require.NotNil(t, tlsCfg)

	assert.Equal(t, uint16(tls.VersionTLS12), tlsCfg.MinVersion)
	assert.Equal(t, []string{"h2", "http/1.1"}, tlsCfg.NextProtos)
	assert.Equal(t, tls.RequireAndVerifyClientCert, tlsCfg.ClientAuth)
	assert.NotNil(t, tlsCfg.GetCertificate)
	assert.NotNil(t, tlsCfg.ClientCAs)

	cert, err := tlsCfg.GetCertificate(nil)
	require.NoError(t, err)
	require.NotNil(t, cert)
}

func TestBuildMTLSConfig_ClientAuthOverride(t *testing.T) {
	dir := t.TempDir()
	certPath := filepath.Join(dir, "server.crt")
	keyPath := filepath.Join(dir, "server.key")
	caPath := filepath.Join(dir, "ca.crt")

	certPEM, keyPEM := generateTLSKeyPair(t, "ui-server")
	require.NoError(t, os.WriteFile(certPath, certPEM, 0644))
	require.NoError(t, os.WriteFile(keyPath, keyPEM, 0644))
	require.NoError(t, os.WriteFile(caPath, certPEM, 0644))

	tlsCfg, err := buildMTLSConfig(certPath, keyPath, config.UIServerMTLS{
		CaFile:     caPath,
		ClientAuth: "verifyIfGiven",
	})
	require.NoError(t, err)
	assert.Equal(t, tls.VerifyClientCertIfGiven, tlsCfg.ClientAuth)
}

func TestBuildMTLSConfig_MissingCertFile(t *testing.T) {
	_, err := buildMTLSConfig("/does/not/exist.crt", "/does/not/exist.key", config.UIServerMTLS{
		CaFile: "/does/not/exist.ca",
	})
	assert.Error(t, err)
}

func TestBuildMTLSConfig_InvalidCA(t *testing.T) {
	dir := t.TempDir()
	certPath := filepath.Join(dir, "server.crt")
	keyPath := filepath.Join(dir, "server.key")
	caPath := filepath.Join(dir, "ca.crt")

	certPEM, keyPEM := generateTLSKeyPair(t, "ui-server")
	require.NoError(t, os.WriteFile(certPath, certPEM, 0644))
	require.NoError(t, os.WriteFile(keyPath, keyPEM, 0644))
	require.NoError(t, os.WriteFile(caPath, []byte("not a cert"), 0644))

	_, err := buildMTLSConfig(certPath, keyPath, config.UIServerMTLS{
		CaFile: caPath,
	})
	assert.Error(t, err)
}

func TestBuildMTLSConfig_InvalidClientAuth(t *testing.T) {
	dir := t.TempDir()
	certPath := filepath.Join(dir, "server.crt")
	keyPath := filepath.Join(dir, "server.key")
	caPath := filepath.Join(dir, "ca.crt")

	certPEM, keyPEM := generateTLSKeyPair(t, "ui-server")
	require.NoError(t, os.WriteFile(certPath, certPEM, 0644))
	require.NoError(t, os.WriteFile(keyPath, keyPEM, 0644))
	require.NoError(t, os.WriteFile(caPath, certPEM, 0644))

	_, err := buildMTLSConfig(certPath, keyPath, config.UIServerMTLS{
		CaFile:     caPath,
		ClientAuth: "totally-not-real",
	})
	assert.Error(t, err)
}

// generateTLSKeyPair returns a PEM-encoded self-signed cert/key pair for
// use as both a server cert and (self-)CA in tests.
func generateTLSKeyPair(t *testing.T, commonName string) (certPEM, keyPEM []byte) {
	t.Helper()
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)
	keyPEM = pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(key)})

	serialLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serial, err := rand.Int(rand.Reader, serialLimit)
	require.NoError(t, err)
	tmpl := x509.Certificate{
		SerialNumber:          serial,
		Subject:               pkix.Name{CommonName: commonName},
		NotBefore:             time.Now().Add(-time.Hour),
		NotAfter:              time.Now().Add(time.Hour),
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment | x509.KeyUsageCertSign,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth, x509.ExtKeyUsageClientAuth},
		IsCA:                  true,
		BasicConstraintsValid: true,
	}
	der, err := x509.CreateCertificate(rand.Reader, &tmpl, &tmpl, &key.PublicKey, key)
	require.NoError(t, err)
	certPEM = pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der})
	return certPEM, keyPEM
}
