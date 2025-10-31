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
	"context"
	"encoding/base64"
	"net/http"
	"strings"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/api"
	"google.golang.org/grpc/metadata"
)

func WithForwardHeaders(headers []string) api.Middleware {
	return func(c echo.Context) runtime.ServeMuxOption {
		return runtime.WithMetadata(handleForwardHeaders(c, headers))
	}
}

func handleForwardHeaders(c echo.Context, headers []string) func(context.Context, *http.Request) metadata.MD {
	return func(ctx context.Context, req *http.Request) metadata.MD {
		md := metadata.MD{}
		for _, header := range headers {
			headerValue := c.Request().Header.Get(header)
			if headerValue != "" {
				if len(header) > 4 && header[len(header)-4:] == "-bin" {
					decoded, err := base64DecodeWithOrWithoutPadding(headerValue)
					if err == nil {
						md.Set(header, string(decoded))
					}
				} else {
					md.Append(header, headerValue)
				}
			}
		}

		return md
	}
}

func base64DecodeWithOrWithoutPadding(s string) ([]byte, error) {
	s = strings.TrimRight(s, "=")
	return base64.RawStdEncoding.DecodeString(s)
}
