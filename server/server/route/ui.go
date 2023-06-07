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
	"fmt"
	"io/fs"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// SetUIRoutes sets UI routes
func SetUIRoutes(e *echo.Echo, publicPath string, assets fs.FS) error {
	assetsHandler := buildUIAssetsHandler(assets)
	e.GET("/_app/*", assetsHandler)
	e.GET("/css/*", assetsHandler)
	e.GET("/prism/*", assetsHandler)
	e.GET("/android*", assetsHandler)
	e.GET("/apple*", assetsHandler)
	e.GET("/banner*", assetsHandler)
	e.GET("/favicon*", assetsHandler)
	e.GET("/logo*", assetsHandler)
	e.GET("/Temporal_Logo_Animation.gif", assetsHandler)
	e.GET("/site.webmanifest", assetsHandler)
	e.GET("/i18n/*", assetsHandler)
	indexHandler, err := buildUIIndexHandler(publicPath, assets)
	if err != nil {
		return err
	}

	e.GET("/*", indexHandler)

	return nil
}

func buildUIIndexHandler(publicPath string, assets fs.FS) (echo.HandlerFunc, error) {
	indexHTMLBytes, err := fs.ReadFile(assets, "index.html")
	if err != nil {
		return nil, err
	}
	if publicPath != "" {
		indexHTML := string(indexHTMLBytes)
		indexHTML = strings.ReplaceAll(indexHTML, "base: \"\"", fmt.Sprintf("base: \"%s\"", publicPath))
		indexHTML = strings.ReplaceAll(indexHTML, "\"/_app/", fmt.Sprintf("\"%s/_app/", publicPath))
		indexHTMLBytes = []byte(indexHTML)
	}

	return func(c echo.Context) (err error) {
		return c.Stream(200, "text/html", bytes.NewBuffer(indexHTMLBytes))
	}, nil
}

func buildUIAssetsHandler(assets fs.FS) echo.HandlerFunc {
	handler := http.FileServer(http.FS(assets))
	return echo.WrapHandler(handler)
}
