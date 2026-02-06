// The MIT License
//
// Copyright (c) 2022 Temporal Technologies Inc.  All rights reserved.
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

package cors

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/temporalio/ui-server/v2/server/config"
)

type mockConfigProvider struct {
	cfg *config.Config
}

func (m *mockConfigProvider) GetConfig() (*config.Config, error) {
	return m.cfg, nil
}

func TestCORSMiddleware_StaticOrigins(t *testing.T) {
	cfg := &config.Config{
		CORS: config.CORS{
			AllowOrigins:          []string{"https://example.com", "https://test.com"},
			UnsafeAllowAllOrigins: false,
		},
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "https://example.com")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	middleware := CORSMiddleware(CORSConfig{
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		ConfigProvider:   &mockConfigProvider{cfg: cfg},
	})

	handler := middleware(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	err := handler(c)
	assert.NoError(t, err)
	assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "true", rec.Header().Get("Access-Control-Allow-Credentials"))
}

func TestCORSMiddleware_UnsafeAllowAllOrigins(t *testing.T) {
	cfg := &config.Config{
		CORS: config.CORS{
			AllowOrigins:          []string{"https://example.com"},
			UnsafeAllowAllOrigins: true,
		},
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "https://malicious.com")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	middleware := CORSMiddleware(CORSConfig{
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		ConfigProvider:   &mockConfigProvider{cfg: cfg},
	})

	handler := middleware(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	err := handler(c)
	assert.NoError(t, err)
	assert.Equal(t, "https://malicious.com", rec.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "true", rec.Header().Get("Access-Control-Allow-Credentials"))
}

func TestCORSMiddleware_StaticOrigins_NotAllowed(t *testing.T) {
	cfg := &config.Config{
		CORS: config.CORS{
			AllowOrigins:          []string{"https://example.com"},
			UnsafeAllowAllOrigins: false,
		},
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "https://malicious.com")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	middleware := CORSMiddleware(CORSConfig{
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		ConfigProvider:   &mockConfigProvider{cfg: cfg},
	})

	handler := middleware(func(c echo.Context) error {
		return c.String(http.StatusOK, "test")
	})

	err := handler(c)
	assert.NoError(t, err)
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
}

func TestCORSMiddleware_PreflightRequest(t *testing.T) {
	cfg := &config.Config{
		CORS: config.CORS{
			AllowOrigins:          []string{"https://example.com"},
			UnsafeAllowAllOrigins: false,
		},
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set("Origin", "https://example.com")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	middleware := CORSMiddleware(CORSConfig{
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		ConfigProvider:   &mockConfigProvider{cfg: cfg},
	})

	handler := middleware(func(c echo.Context) error {
		return c.String(http.StatusOK, "should not reach here")
	})

	err := handler(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
}