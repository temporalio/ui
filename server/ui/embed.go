package ui

import "embed"

//go:generate env VITE_API= BUILD_PATH=server/ui/assets pnpm vite build

//go:embed all:assets/*
var Assets embed.FS
