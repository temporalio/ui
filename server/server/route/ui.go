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
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"path"
	"regexp"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"

	"github.com/labstack/echo/v4"
)

// SetUIRoutes sets UI routes
func SetUIRoutes(e *echo.Echo, publicPath string, assets fs.FS) error {
	assetsHandler := buildUIAssetsHandler(assets)
	e.GET("/_app/*", assetsHandler)
	e.GET("/css/*", assetsHandler)
	e.GET("/codemirror/*", assetsHandler)
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

func removeCSPMeta(htmlStr string) string {
	re := regexp.MustCompile(`(?i)<meta[^>]*http-equiv\s*=\s*["']content-security-policy["'][^>]*>`)
	return re.ReplaceAllString(htmlStr, "")
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
		log.Printf("WARNING: CSP IS DISABLED WHEN USING PUBLIC PATH!")
		indexHTML = removeCSPMeta(indexHTML)
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

func generateNonce() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		panic(err)
	}
	return hex.EncodeToString(bytes)
}

// Generate CSP header
func generateCSP(nonce string) string {
	return fmt.Sprintf(
		"base-uri 'self'; default-src 'none'; style-src 'nonce-%s'; script-src 'nonce-%s'; frame-ancestors 'self'; form-action 'none'; sandbox allow-same-origin allow-popups allow-popups-to-escape-sandbox;",
		nonce,
		nonce,
	)
}

// Process markdown content
func processMarkdown(content string) string {
	// Create markdown parser with extensions
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs
	p := parser.NewWithExtensions(extensions)

	// Parse markdown to AST
	ast := p.Parse([]byte(content))

	// Setup HTML renderer
	opts := html.RendererOptions{
		Flags: html.CommonFlags | html.HrefTargetBlank,
	}
	renderer := html.NewRenderer(opts)

	// Render to HTML
	return string(markdown.Render(ast, renderer))
}

// Template for the HTML page
const pageTemplate = `
<!DOCTYPE html>
<html>
<head>
	<title>Rendered Markdown</title>
	<base target="_blank">
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style nonce="{{.Nonce}}">
			{{.CSS}}
	</style>
</head>
<body class="prose" {{if .Theme}}data-theme="{{.Theme}}"{{end}}>
	<main>
			{{.Content}}
	</main>
</body>
</html>
`

func SetRenderRoute(e *echo.Echo, publicPath string) {
	renderPath := path.Join(publicPath, "render")

	// Parse template once at startup
	tmpl := template.Must(template.New("page").Parse(pageTemplate))

	e.GET(renderPath, func(c echo.Context) error {
		content := c.QueryParam("content")
		theme := c.QueryParam("theme")

		// Process markdown to HTML
		renderedHTML := processMarkdown(content)

		nonce := generateNonce()

		data := struct {
			Content template.HTML
			Nonce   string
			Theme   string
			CSS     string
		}{
			Content: template.HTML(renderedHTML),
			Nonce:   nonce,
			Theme:   theme,
			CSS: `*,
		body {
			margin: 0;
			padding: 0;
			border: 0;
			font-size: 100%;
			vertical-align: baseline;
		}

		body {
			overscroll-behavior: none;
			position: relative;
			padding: 1rem;
			white-space: pre-line;
			font-family: sans-serif;
		}

		h1 {
			font-size: 2em;
		}

		h2 {
			font-size: 1.5em;
		}

		h3 {
			font-size: 1.17em;
		}

		h4 {
			font-size: 1em;
		}

		h5 {
			font-size: 0.83em;
		}

		h6 {
			font-size: 0.67em;
		}

		blockquote,
		q {
			quotes: none;
		}
		blockquote:before,
		blockquote:after,
		q:before,
		q:after {
			content: '';
			content: none;
		}

		table {
			border-collapse: collapse;
			border-spacing: 0;
		}

		ul,
		ol {
			white-space: normal;
		}

		li {
			list-style-position: inside;
		}

		li * {
			display: inline;
		}

		a {
			gap: 0.5rem;
			align-items: center;
			border-radius: 0.25rem;
			max-width: fit-content;
			text-decoration: underline;
			text-underline-offset: 2px;
			cursor: pointer;
		}

		blockquote {
			padding-top: 0;
			padding-bottom: 0;
			padding-left: 0.5rem;
			border-left: 4px solid;
			border-left-color: #92a4c3;
			background: #e8efff;
			color: #121416;
		}

		blockquote p {
			font-size: 1.25rem;
			line-height: 1.75rem;
		}

		code {
			font-family: monospace;
			padding-top: 0.125rem;
			padding-bottom: 0.125rem;
			padding-left: 0.25rem;
			padding-right: 0.25rem;
			border-radius: 0.25rem;
			background: #e8efff;
			color: #121416;
		}

		pre {
			font-family: monospace;
			padding: 0.25rem;
			border-radius: 0.25rem;
			background: #e8efff;
			color: #121416;
		}

		pre code {
			padding: 0;
		}

		body[data-theme='light'] {
			background-color: #fff;
			color: #121416;
		}

		body[data-theme='light'] a {
			color: #444ce7;
		}

		body[data-theme='dark'] {
  		background-color: #141414;
			color: #f8fafc;
		}
			
		body[data-theme='dark'] a {
				color: #8098f9;
			}`,
		}

		// Set headers
		c.Response().Header().Set("Content-Type", "text/html")
		c.Response().Header().Set("Content-Security-Policy", generateCSP(nonce))

		err := tmpl.Execute(c.Response().Writer, data)
		if err != nil {
			return err
		}

		return nil
	})
}
