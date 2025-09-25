package service

import (
	"bufio"
	"context"
	"devctl/app/config"
	"io"
	"os/exec"
	"sync"
	"syscall"

	"github.com/pkg/errors"
)

var Statuses = map[string]string{
	"Pending":    "Pending",
	"Starting":   "Starting",
	"Restarting": "Restarting",
	"Running":    "Running",
	"Stopping":   "Stopping",
	"Error":      "Error",
	"Crashed":    "Crashed",
	"Exited":     "Exited",
	"Healthy":    "Healthy",
	"Unhealthy":  "Unhealthy",
}

func New() *Handler {
	return &Handler{}
}

type Handler struct {
	svc config.ServiceConfig

	focus string
	mute  string

	stdoutCB func(string)
	stderrCB func(string)
	statusCB func(string)
}

func (h *Handler) SetConfig(svc config.ServiceConfig) *Handler {
	h.svc = svc
	return h
}

func (h *Handler) SetStdOutCallback(cb func(string)) *Handler {
	h.stdoutCB = cb
	return h
}

func (h *Handler) SetStdErrCallback(cb func(string)) *Handler {
	h.stderrCB = cb
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

func (h *Handler) SetStatusCallback(cb func(string)) *Handler {
	h.statusCB = cb
	return h
}

func (h *Handler) sendStatus(status string) {
	if h.statusCB == nil {
		return
	}

	h.statusCB(status)
}

func (h *Handler) Start(ctx context.Context) error {
	h.sendStatus("Starting")
	cmd := exec.CommandContext(ctx, "sh", "-c", h.svc.Cmd)
	// set process group ID so we can kill the entire process group on cancel
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		h.sendStatus("Error")
		return errors.Wrap(err, "failed to attach stdout")
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		h.sendStatus("Error")
		return errors.Wrap(err, "failed to attach stderr")
	}

	if err := cmd.Start(); err != nil {
		h.sendStatus("Crashed")
		return errors.Wrap(err, "failed to start command")
	}

	h.sendStatus("Running")
	// kill the process group on context cancellation
	go func() {
		<-ctx.Done()
		if cmd.Process != nil {
			if pgid, err := syscall.Getpgid(cmd.Process.Pid); err == nil {
				syscall.Kill(-pgid, syscall.SIGKILL)
			} else {
				_ = cmd.Process.Kill()
			}
		}
	}()

	if err := h.processStreams(stdout, stderr); err != nil {
		return errors.Wrap(err, "failed to process streams")
	}

	if err := cmd.Wait(); err != nil {
		h.sendStatus("Crashed")
		return errors.Wrap(err, "command exited with error")
	}

	h.sendStatus("Exited")

	return nil
}

func (h *Handler) processStreams(stdout, stderr io.Reader) error {
	var outWg sync.WaitGroup
	outWg.Add(2)

	go func() {
		defer outWg.Done()
		h.processStream(stdout, h.stdoutCB)
	}()

	go func() {
		defer outWg.Done()
		h.processStream(stderr, h.stderrCB)
	}()

	outWg.Wait()

	// Implement stop logic if needed
	return nil
}

// processStream reads lines from the provided reader and applies filtering based on focus and mute.
// For each line that passes the filters, it calls handleLine with the line text.
func (h *Handler) processStream(r io.Reader, handleLine func(string)) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		text := scanner.Text()
		if h.focus != "" && h.focus != h.svc.Name {
			continue
		}
		if h.mute != "" && h.mute == h.svc.Name {
			continue
		}

		handleLine(text)
	}
}
