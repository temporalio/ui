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

package rpc

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/temporalio/ui-server/v2/server/config"
)

const (
	localHostPort = "127.0.0.1:7233"
)

var netClient HttpGetter = &http.Client{
	Timeout: time.Second * 10,
}

type HttpGetter interface {
	Get(url string) (resp *http.Response, err error)
}

type certLoader struct {
	CertFile    string
	KeyFile     string
	cachedCert  *tls.Certificate
	lastModTime time.Time
	lock        sync.RWMutex
}

func (l *certLoader) GetClientCertificate(_ *tls.CertificateRequestInfo) (*tls.Certificate, error) {
	stat, err := os.Stat(l.KeyFile)
	if err != nil {
		l.lock.RLock()
		existingCert := l.cachedCert
		l.lock.RUnlock()

		if existingCert == nil {
			return nil, fmt.Errorf("statting tls key file: %w", err)
		}

		log.Printf("unable to stat tls key file, returning cached cert which may expire: %s", err)
		return existingCert, nil
	}

	l.lock.RLock()
	if existingCert := l.cachedCert; existingCert != nil && stat.ModTime().Equal(l.lastModTime) {
		l.lock.RUnlock()
		log.Printf("tls cert unchanged on disk; returning cached cert")
		return existingCert, nil
	}
	l.lock.RUnlock()

	// If the cert file and key file don't match, tls.LoadX509KeyPair will
	// return an error. This will protect us from a race condition where the key
	// file has been written but the cert file has not yet. We'll log the error
	// but keep returning the previous cert until loading the new cert succeeds.
	cert, err := tls.LoadX509KeyPair(l.CertFile, l.KeyFile)

	l.lock.Lock()
	defer l.lock.Unlock()
	if err != nil {
		log.Printf("unable to load tls key pair, returning cached cert which may expire: %s", err)
		return l.cachedCert, nil
	}
	log.Printf("loaded new tls key pair")

	l.cachedCert = &cert
	l.lastModTime = stat.ModTime()

	return l.cachedCert, nil
}

func CreateTLSConfig(address string, cfg *config.TLS) (*tls.Config, error) {
	err := validateTLSConfig(cfg)
	if err != nil {
		return nil, err
	}

	var tlsConfig *tls.Config

	// If we are given a server name, set the TLS server name for DNS resolution
	if cfg.ServerName != "" {
		host := cfg.ServerName
		tlsConfig = NewTLSConfigForServer(host, cfg.EnableHostVerification)
	}

	configureCertPool := cfg.CaFile != "" || cfg.CaData != ""

	// validateTLSConfig above ensures these two cases are mutually exclusive
	configureKeyPairFromFile := cfg.CertFile != "" || cfg.KeyFile != ""
	configureKeyPairFromBytes := cfg.CertData != "" || cfg.KeyData != ""

	if !configureCertPool && !configureKeyPairFromFile && !configureKeyPairFromBytes {
		return tlsConfig, nil
	}

	// Initialize tls.Config with address in case server name is not in configuration
	if tlsConfig == nil {
		hostPort := address
		if hostPort == "" {
			hostPort = localHostPort
		}
		// Ignoring error as we'll fail to dial anyway, and that will produce a meaningful error
		host, _, _ := net.SplitHostPort(hostPort)
		tlsConfig = NewTLSConfigForServer(host, cfg.EnableHostVerification)
	}

	if configureCertPool {
		caCertPool, err := loadCACert(cfg)
		if err != nil {
			log.Fatalf("Unable to load server CA certificate")
			return nil, err
		}
		tlsConfig.RootCAs = caCertPool
	}

	if configureKeyPairFromFile {
		// Configure server to reload client cert from file if it changes on
		// disk.
		certLoader := &certLoader{
			CertFile: cfg.CertFile,
			KeyFile:  cfg.KeyFile,
			lock:     sync.RWMutex{},
		}
		tlsConfig.GetClientCertificate = certLoader.GetClientCertificate
	}

	if configureKeyPairFromBytes {
		// Load key pair from provided bytes.
		keyPair, err := loadKeyPair(cfg)
		if err != nil {
			log.Fatalf("Unable to load client certificate")
			return nil, err
		}
		tlsConfig.Certificates = []tls.Certificate{keyPair}
	}

	return tlsConfig, nil
}

func loadCACert(cfg *config.TLS) (caPool *x509.CertPool, err error) {
	pathOrUrl := cfg.CaFile
	caData := cfg.CaData

	caPool = x509.NewCertPool()
	var caBytes []byte

	if strings.HasPrefix(pathOrUrl, "http://") {
		return nil, errors.New("HTTP is not supported for CA cert URLs. Provide HTTPS URL")
	}

	if strings.HasPrefix(pathOrUrl, "https://") {
		resp, err := netClient.Get(pathOrUrl)
		if err != nil {
			return nil, fmt.Errorf("unable  to load CA cert from URL: %v", err)
		}
		defer resp.Body.Close()
		caBytes, err = io.ReadAll(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("unable to load CA cert from URL: %v", err)
		}

		log.Printf("Loaded TLS CA cert from URL: %v", pathOrUrl)
	} else if pathOrUrl != "" {
		caBytes, err = os.ReadFile(pathOrUrl)
		if err != nil {
			return nil, fmt.Errorf("unable to load CA cert from file: %v", err)
		}
		log.Printf("Loaded TLS CA cert from file: %v", pathOrUrl)
	} else if caData != "" {
		caBytes, err = base64.StdEncoding.DecodeString(caData)
		if err != nil {
			return nil, fmt.Errorf("unable to decode CA cert from base64: %v", err)
		}
		log.Printf("Loaded CA cert from base64")
	}

	if !caPool.AppendCertsFromPEM(caBytes) {
		return nil, errors.New("unknown failure constructing cert pool for ca")
	}
	return caPool, nil
}

func loadKeyPair(cfg *config.TLS) (tls.Certificate, error) {
	var certBytes []byte
	var keyBytes []byte
	var err error

	keyBytes, err = base64.StdEncoding.DecodeString(cfg.KeyData)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("unable to decode TLS key from base64: %w", err)
	}
	log.Printf("Loaded TLS key from base64")

	certBytes, err = base64.StdEncoding.DecodeString(cfg.CertData)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("unable to decode TLS cert from base64: %w", err)
	}
	log.Printf("Loaded TLS cert from base64")

	keyPair, err := tls.X509KeyPair(certBytes, keyBytes)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("unable to generate x509 key pair: %w", err)
	}

	return keyPair, err
}

func NewEmptyTLSConfig() *tls.Config {
	return &tls.Config{
		MinVersion: tls.VersionTLS12,
		NextProtos: []string{
			"h2",
		},
	}
}

func NewTLSConfigForServer(
	serverName string,
	enableHostVerification bool,
) *tls.Config {
	c := NewEmptyTLSConfig()
	c.ServerName = serverName
	c.InsecureSkipVerify = !enableHostVerification
	return c
}

func validateTLSConfig(cfg *config.TLS) error {
	if cfg.CertFile != "" && cfg.CertData != "" {
		return fmt.Errorf("cannot specify TLS cert file and cert data at the same time")
	}
	if cfg.KeyFile != "" && cfg.KeyData != "" {
		return fmt.Errorf("cannot specify TLS key file and key data at the same time")
	}
	if cfg.CaFile != "" && cfg.CaData != "" {
		return fmt.Errorf("cannot specify TLS CA file and CA data at the same time")
	}

	return nil
}
