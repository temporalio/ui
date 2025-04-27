package service

import (
	"strings"
	"testing"
)

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

