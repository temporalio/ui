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

package headers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc/metadata"
)

func TestBase64DecodeWithOrWithoutPadding(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
		wantErr  bool
	}{
		{
			name:     "base64 with padding",
			input:    "YmluYXJ5IGRhdGE=",
			expected: "binary data",
			wantErr:  false,
		},
		{
			name:     "base64 without padding",
			input:    "YmluYXJ5IGRhdGE",
			expected: "binary data",
			wantErr:  false,
		},
		{
			name:     "invalid base64",
			input:    "not-valid-base64!!!",
			expected: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			decoded, err := base64DecodeWithOrWithoutPadding(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, string(decoded))
			}
		})
	}
}

func TestHandleForwardHeaders(t *testing.T) {
	tests := []struct {
		name             string
		headers          []string
		requestHeaders   map[string]string
		expectedMetadata map[string][]string
	}{
		{
			name:    "forward regular headers",
			headers: []string{"X-Custom-Header", "Authorization"},
			requestHeaders: map[string]string{
				"X-Custom-Header": "custom-value",
				"Authorization":   "Bearer token",
			},
			expectedMetadata: map[string][]string{
				"X-Custom-Header": {"custom-value"},
				"Authorization":   {"Bearer token"},
			},
		},
		{
			name:    "forward binary header in base64 encoding with padding",
			headers: []string{"X-Binary-Header-bin"},
			requestHeaders: map[string]string{
				"X-Binary-Header-bin": "YmluYXJ5IGRhdGE=",
			},
			expectedMetadata: map[string][]string{
				"X-Binary-Header-bin": {"binary data"},
			},
		},
		{
			name:    "forward binary header in base64 encoding without padding",
			headers: []string{"X-Data-bin"},
			requestHeaders: map[string]string{
				"X-Data-bin": "YmluYXJ5IGRhdGE=",
			},
			expectedMetadata: map[string][]string{
				"X-Data-bin": {"binary data"},
			},
		},
		{
			name:    "mixed regular and binary headers",
			headers: []string{"X-Regular", "X-Binary-bin"},
			requestHeaders: map[string]string{
				"X-Regular":    "regular-value",
				"X-Binary-bin": "YmluYXJ5LXZhbHVl=",
			},
			expectedMetadata: map[string][]string{
				"X-Regular":    {"regular-value"},
				"X-Binary-bin": {"binary-value"},
			},
		},
		{
			name:    "skip empty headers",
			headers: []string{"X-Present", "X-Missing"},
			requestHeaders: map[string]string{
				"X-Present": "present-value",
			},
			expectedMetadata: map[string][]string{
				"X-Present": {"present-value"},
			},
		},
		{
			name:    "skip invalid base64 in binary header",
			headers: []string{"X-Invalid-bin"},
			requestHeaders: map[string]string{
				"X-Invalid-bin": "not-valid-base64!!!",
			},
			expectedMetadata: map[string][]string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			for k, v := range tt.requestHeaders {
				req.Header.Set(k, v)
			}
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handle := handleForwardHeaders(c, tt.headers)
			var actualMetadata metadata.MD = handle(nil, nil)

			assert.Equal(t, len(tt.expectedMetadata), len(actualMetadata), "metadata length mismatch")

			for expectedKey, expectedValues := range tt.expectedMetadata {
				values := actualMetadata.Get(expectedKey)
				assert.Equal(t, expectedValues, values, "metadata mismatch for key %s", expectedKey)
			}
		})
	}
}
