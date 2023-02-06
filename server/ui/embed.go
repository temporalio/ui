package ui

import (
	"embed"
	"io/fs"
)

//go:generate env VITE_API= BUILD_PATH=server/ui/assets pnpm vite build

//go:embed all:assets
var assets embed.FS

func Assets() (fs.FS, error) {
	return fs.Sub(assets, "assets")
}
