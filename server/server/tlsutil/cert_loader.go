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

package tlsutil

import (
	"crypto/tls"
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

// CertLoader is a hot-reloading TLS key-pair loader. It caches the parsed
// key pair and reloads from disk when the cert file's mtime changes.
//
// A CertLoader has callback functions allowing it to be used for client and server
// connections.
type CertLoader struct {
	CertFile    string
	KeyFile     string
	cachedCert  *tls.Certificate
	lastModTime time.Time
	lock        sync.RWMutex
}

func NewCertLoader(certFile, keyFile string) *CertLoader {
	return &CertLoader{CertFile: certFile, KeyFile: keyFile}
}

// GetClientCertificate is a tls.Config.GetClientCertificate callback used when communciating
// with the temporal frontend.
func (l *CertLoader) GetClientCertificate(_ *tls.CertificateRequestInfo) (*tls.Certificate, error) {
	return l.getCert()
}

// GetCertificate is a tls.Config.GetCertificate callback used when terminating inbound TLS from clients.
func (l *CertLoader) GetCertificate(_ *tls.ClientHelloInfo) (*tls.Certificate, error) {
	return l.getCert()
}

// getCert returns the cached key pair if the cert file on disk is unchanged,
// otherwise reloads from disk. On reload failure the last known-good cert is
// returned.
func (l *CertLoader) getCert() (*tls.Certificate, error) {
	stat, err := os.Stat(l.CertFile)
	if err != nil {
		l.lock.RLock()
		existingCert := l.cachedCert
		l.lock.RUnlock()

		if existingCert == nil {
			return nil, fmt.Errorf("statting tls cert file: %w", err)
		}

		log.Printf("unable to stat tls cert file, returning cached cert which may expire: %s", err)
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
