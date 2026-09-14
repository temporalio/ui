package rpc

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
)

func TestCertLoader_ReloadsNewKeyPair(t *testing.T) {
	tests := []struct {
		name     string
		reuseKey bool
	}{
		{
			name:     "regenerate both cert and key",
			reuseKey: false,
		},
		{
			name:     "regenerate only cert with same key",
			reuseKey: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := t.TempDir()
			certPath := filepath.Join(dir, "cert.pem")
			keyPath := filepath.Join(dir, "key.pem")

			certPEM1, keyPEM1 := generateCertKeyPair(t, "initial")
			assert.NoError(t, os.WriteFile(certPath, certPEM1, 0644))
			assert.NoError(t, os.WriteFile(keyPath, keyPEM1, 0644))

			loader := &certLoader{CertFile: certPath, KeyFile: keyPath}

			loaded1, err := loader.GetClientCertificate(nil)
			assert.NoError(t, err)
			assert.NotNil(t, loaded1)

			expect1, err := tls.X509KeyPair(certPEM1, keyPEM1)
			assert.NoError(t, err)
			assert.Equal(t, expect1.Certificate, loaded1.Certificate)

			time.Sleep(500 * time.Millisecond)

			var certPEM2, keyPEM2 []byte
			if tt.reuseKey {
				certPEM2 = generateCertForKey(t, "updated", keyPEM1)
				keyPEM2 = keyPEM1
			} else {
				certPEM2, keyPEM2 = generateCertKeyPair(t, "updated")
			}

			assert.NoError(t, os.WriteFile(certPath, certPEM2, 0644))

			if !tt.reuseKey {
				assert.NoError(t, os.WriteFile(keyPath, keyPEM2, 0644))
			}

			loaded2, err := loader.GetClientCertificate(nil)
			assert.NoError(t, err)
			assert.NotNil(t, loaded2)

			expect2, err := tls.X509KeyPair(certPEM2, keyPEM2)
			assert.NoError(t, err)

			assert.Equal(t, expect2.Certificate, loaded2.Certificate)
			assert.Equal(t, expect2.PrivateKey, loaded2.PrivateKey)
			assert.NotEqual(t, expect1.Certificate, loaded2.Certificate)
		})
	}
}

func generateCertKeyPair(t *testing.T, commonName string) (certPEM, keyPEM []byte) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	assert.NoError(t, err)
	keyPEM = pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(key)})
	certPEM = generateCertForKey(t, commonName, keyPEM)
	return certPEM, keyPEM
}

func generateCertForKey(t *testing.T, commonName string, existingKeyPEM []byte) []byte {
	block, _ := pem.Decode(existingKeyPEM)
	assert.NotNil(t, block)
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	assert.NoError(t, err)

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	assert.NoError(t, err)
	tmpl := x509.Certificate{
		SerialNumber:          serialNumber,
		Subject:               pkix.Name{CommonName: commonName},
		NotBefore:             time.Now().Add(-time.Hour),
		NotAfter:              time.Now().Add(time.Hour),
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		IsCA:                  true,
		BasicConstraintsValid: true,
	}
	derBytes, err := x509.CreateCertificate(rand.Reader, &tmpl, &tmpl, &key.PublicKey, key)
	assert.NoError(t, err)
	return pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
}
