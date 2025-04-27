package app

import (
   "errors"
   "os"
   "path/filepath"
   "testing"
   
   cli "github.com/urfave/cli/v2"
)

// TestHandlerSetters ensures fluent setters set internal fields correctly.
func TestHandlerSetters(t *testing.T) {
   h := New().
       SetConfigDir("cfg").
       SetMode("m").
       SetFocus("f").
       SetMute("u").
       SetTUI(true)
   if h.configDir != "cfg" {
       t.Errorf("configDir: expected %q, got %q", "cfg", h.configDir)
   }
   if h.mode != "m" {
       t.Errorf("mode: expected %q, got %q", "m", h.mode)
   }
   if h.focus != "f" {
       t.Errorf("focus: expected %q, got %q", "f", h.focus)
   }
   if h.mute != "u" {
       t.Errorf("mute: expected %q, got %q", "u", h.mute)
   }
   if !h.tui {
       t.Error("tui: expected true, got false")
   }
}

// helper to suppress stdout and stderr during test
func suppressOutput(f func()) {
   origOut, origErr := os.Stdout, os.Stderr
   null, _ := os.OpenFile(os.DevNull, os.O_WRONLY, 0)
   os.Stdout, os.Stderr = null, null
   defer func() {
       null.Close()
       os.Stdout, os.Stderr = origOut, origErr
   }()
   f()
}

// TestRun_Success verifies Run sets environment and returns nil on valid config.
func TestRun_Success(t *testing.T) {
   dir := t.TempDir()
   // write .env.test
   key := "__TEST_APP_RUN__"
   val := "VALUE"
   envF := filepath.Join(dir, ".env.test")
   if err := os.WriteFile(envF, []byte(key+"="+val+"\n"), 0644); err != nil {
       t.Fatalf("writing env file: %v", err)
   }
   // write Procfile.test
   procF := filepath.Join(dir, "Procfile.test")
   if err := os.WriteFile(procF, []byte("svc: echo ok\n"), 0644); err != nil {
       t.Fatalf("writing Procfile: %v", err)
   }
   defer os.Unsetenv(key)
   h := New().SetConfigDir(dir).SetMode("test")
   suppressOutput(func() {
       if err := h.Run(); err != nil {
           t.Fatalf("expected nil error, got %v", err)
       }
   })
   if got := os.Getenv(key); got != val {
       t.Errorf("env var %s: expected %q, got %q", key, val, got)
   }
}

// TestRun_ProcfileMissing verifies Run returns ExitError when Procfile is missing.
func TestRun_ProcfileMissing(t *testing.T) {
   dir := t.TempDir()
   h := New().SetConfigDir(dir).SetMode("noexistent")
   var exitCoder cli.ExitCoder
   suppressOutput(func() {
       err := h.Run()
       if !errors.As(err, &exitCoder) {
           t.Fatalf("expected cli.ExitCoder, got %v", err)
       }
       if exitCoder.ExitCode() != 1 {
           t.Errorf("expected exit code 1, got %d", exitCoder.ExitCode())
       }
   })
}