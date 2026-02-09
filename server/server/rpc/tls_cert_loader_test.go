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
	// Use Go testing temporary directory for test files
	dir := t.TempDir()
	certPath := filepath.Join(dir, "cert.pem")
	keyPath := filepath.Join(dir, "key.pem")

	// Write initial certificate and key
	certPEM1, keyPEM1 := generateCertKeyPair(t, "initial")
	assert.NoError(t, os.WriteFile(certPath, certPEM1, 0644))
	assert.NoError(t, os.WriteFile(keyPath, keyPEM1, 0644))

	// Initialize the loader
	loader := &certLoader{CertFile: certPath, KeyFile: keyPath}

	// First load should read the initial pair
	loaded1, err := loader.GetClientCertificate(nil)
	assert.NoError(t, err)
	assert.NotNil(t, loaded1)

	// Compare against a direct X509KeyPair parse
	expect1, err := tls.X509KeyPair(certPEM1, keyPEM1)
	assert.NoError(t, err)
	assert.Equal(t, expect1.Certificate, loaded1.Certificate)

	// Wait to ensure file modification time will differ
	time.Sleep(500 * time.Millisecond)

	// Overwrite with a new certificate and key
	certPEM2, keyPEM2 := generateCertKeyPair(t, "updated")
	assert.NoError(t, os.WriteFile(certPath, certPEM2, 0644))
	assert.NoError(t, os.WriteFile(keyPath, keyPEM2, 0644))

	// Second load should pick up the updated pair
	loaded2, err := loader.GetClientCertificate(nil)
	assert.NoError(t, err)
	assert.NotNil(t, loaded2)

	expect2, err := tls.X509KeyPair(certPEM2, keyPEM2)
	assert.NoError(t, err)

	// Compare the loaded certificate with the expected one
	assert.Equal(t, expect2.Certificate, loaded2.Certificate)

	// Ensure the loader did not return the old certificate
	assert.NotEqual(t, expect1.Certificate, loaded2.Certificate)
}

// generateCertKeyPair creates a self-signed certificate and private key for testing.
func generateCertKeyPair(t *testing.T, commonName string) (certPEM, keyPEM []byte) {
	// Generate a private key
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	assert.NoError(t, err)
	// Create a certificate template
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
	// Self-sign the certificate
	derBytes, err := x509.CreateCertificate(rand.Reader, &tmpl, &tmpl, &key.PublicKey, key)
	assert.NoError(t, err)
	// PEM encode the certificate and key
	certPEM = pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	keyPEM = pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(key)})
	return certPEM, keyPEM
}
