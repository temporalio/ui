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

package route

import (
	"bytes"
	"embed"
	"io/fs"
	"net/http"

	"github.com/labstack/echo/v4"
)

// SetAPIRoutes sets api routes
func SetSwaggerUIRoutes(e *echo.Echo, indexHTML []byte, assets embed.FS) {
	e.GET("/openapi", buildSwaggerUIHandler(indexHTML))
	e.GET("/openapi/*", buildSwaggerUIAssetsHander(assets))
}

func buildSwaggerUIHandler(indexHTML []byte) echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		return c.Stream(200, "text/html", bytes.NewBuffer(indexHTML))
	}
}

func buildSwaggerUIAssetsHander(assets embed.FS) echo.HandlerFunc {
	stream := fs.FS(assets)
	stream, _ = fs.Sub(stream, "generated")
	handler := http.FileServer(http.FS(stream))
	return echo.WrapHandler(handler)
}
