// The MIT License
//
// Copyright (c) 2020 Temporal Technologies Inc.  All rights reserved.
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

package csrf

import (
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"

	"github.com/stretchr/testify/assert"
)

func TestSkipOnAuthorizationHeader(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(echo.GET, "/api/v1/settings", nil)
	rec := httptest.NewRecorder()

	tests := map[string]struct {
		ctx                 echo.Context
		authorizationHeader string
		expected            bool
	}{
		"authorization empty": {
			ctx:                 e.NewContext(req, rec),
			authorizationHeader: "",
			expected:            false,
		},
		"authorization set": {
			ctx:                 e.NewContext(req, rec),
			authorizationHeader: "Bearer xxx",
			expected:            true,
		},
	}

	for name, tt := range tests {
		t.Run(name, func(t *testing.T) {
			tt.ctx.Request().Header.Set(echo.HeaderAuthorization, tt.authorizationHeader)
			assert.Equal(t, SkipOnAuthorizationHeader(tt.ctx), tt.expected)
		})
	}
}
