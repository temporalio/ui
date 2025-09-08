package service

import (
   "io"
   "strings"
   "testing"
   "devctl/app/config"
)

// ProcessStream is a helper that wraps Handler.processStream to apply focus and mute filters.
func ProcessStream(r io.Reader, svcName, focus, mute string, cb func(string)) {
   h := New().SetConfig(config.ServiceConfig{Name: svcName})
   h.SetFocus(focus)
   h.SetMute(mute)
   h.processStream(r, cb)
}

func TestProcessStream_AllLines(t *testing.T) {
	data := "line1\nline2\nline3\n"
	r := strings.NewReader(data)
	var lines []string
	ProcessStream(r, "svc", "", "", func(line string) {
		lines = append(lines, line)
	})
	if len(lines) != 3 {
		t.Errorf("expected 3 lines, got %d", len(lines))
	}
}

func TestProcessStream_FocusFiltering(t *testing.T) {
	data := "a\nb\nc\n"
	r := strings.NewReader(data)
	var lines []string
	ProcessStream(r, "svc", "other", "", func(line string) {
		lines = append(lines, line)
	})
	if len(lines) != 0 {
		t.Errorf("expected 0 lines for focus mismatch, got %d", len(lines))
	}
}

func TestProcessStream_MuteFiltering(t *testing.T) {
	data := "x\ny\nz\n"
	r := strings.NewReader(data)
	var lines []string
	ProcessStream(r, "svc", "", "svc", func(line string) {
		lines = append(lines, line)
	})
	if len(lines) != 0 {
		t.Errorf("expected 0 lines for mute match, got %d", len(lines))
	}
}

