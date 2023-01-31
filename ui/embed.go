package ui

import "embed"

//go:generate env VITE_API="" pnpm vite build

//go:embed all:build/*
var Assets embed.FS
