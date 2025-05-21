package app

import (
	"context"
	"devctl/app/contexts"
	"devctl/app/runner"
	"devctl/app/tui"
	"fmt"
	"net/http"
	"os"

	"github.com/urfave/cli/v2"
)

func New() *Handler {
	return &Handler{}
}

type Handler struct {
	// ConfigDir is the directory containing config files.
	configDir string
	// Mode is the mode to run (e.g., dev, prod).
	mode string
	// Focus is the service to focus on.
	focus string
	// Mute is the service to mute.
	mute string
	// tui is the flag to enable the TUI.
	noTUI bool
}

func (h *Handler) SetConfigDir(configDir string) *Handler {
	h.configDir = configDir

	return h
}

func (h *Handler) SetMode(mode string) *Handler {
	h.mode = mode

	return h
}

func (h *Handler) SetFocus(focus string) *Handler {
	h.focus = focus

	return h
}

func (h *Handler) SetMute(mute string) *Handler {
	h.mute = mute

	return h
}

func (h *Handler) SetTUI(tui bool) *Handler {
	h.noTUI = tui

	return h
}

func (h *Handler) Run() error {
	if h.noTUI {
		return h.runServices()
	}

	return tui.Run(h.configDir, h.mode, h.focus, h.mute)
}

// runServices initializes and runs the service runner.
func (h *Handler) runServices() error {
	opts := runner.Options{
		ConfigDir:  h.configDir,
		Mode:       h.mode,
		Focus:      h.focus,
		Mute:       h.mute,
		HTTPClient: http.DefaultClient,
	}

	r := runner.New(opts)

	ctx, cancel := contexts.WithSignalCancel(context.Background())
	defer cancel()

	if err := r.Run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		return cli.Exit("", 1)
	}

	return nil
}
