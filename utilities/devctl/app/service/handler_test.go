package service

import (
   "context"
   "testing"
   "devctl/app/config"
)

// TestStart_Success verifies that stdout/stderr callbacks receive lines and statuses sequence on success.
func TestStart_Success(t *testing.T) {
   ctx := context.Background()
   var statuses []string
   var outLines []string
   var errLines []string
   // Command: print to stdout and stderr
   cmd := "printf 'out1\nout2\n'; printf 'err1\n' >&2"
   h := New().
       SetConfig(config.ServiceConfig{Name: "svc", Cmd: cmd}).
       SetStdOutCallback(func(line string) { outLines = append(outLines, line) }).
       SetStdErrCallback(func(line string) { errLines = append(errLines, line) }).
       SetStatusCallback(func(s string) { statuses = append(statuses, s) })
   err := h.Start(ctx)
   if err != nil {
       t.Fatalf("expected no error, got %v", err)
   }
   // Verify stdout lines
   if len(outLines) != 2 || outLines[0] != "out1" || outLines[1] != "out2" {
       t.Errorf("unexpected stdout lines: %v", outLines)
   }
   // Verify stderr lines
   if len(errLines) != 1 || errLines[0] != "err1" {
       t.Errorf("unexpected stderr lines: %v", errLines)
   }
   // Verify status callbacks
   want := []string{"Starting", "Running", "Exited"}
   if len(statuses) != len(want) {
       t.Fatalf("expected statuses %v, got %v", want, statuses)
   }
   for i, s := range want {
       if statuses[i] != s {
           t.Errorf("status[%d]: expected %q, got %q", i, s, statuses[i])
       }
   }
}

// TestStart_Failure verifies that a non-zero exit code triggers a Crashed status and returns error.
func TestStart_Failure(t *testing.T) {
   ctx := context.Background()
   var statuses []string
   // Command exits with code 1
   cmd := "exit 1"
   h := New().
       SetConfig(config.ServiceConfig{Name: "svc", Cmd: cmd}).
       SetStatusCallback(func(s string) { statuses = append(statuses, s) })
   err := h.Start(ctx)
   if err == nil {
       t.Fatal("expected error on non-zero exit, got nil")
   }
   // Expect Starting -> Running -> Crashed
   want := []string{"Starting", "Running", "Crashed"}
   if len(statuses) != len(want) {
       t.Fatalf("expected statuses %v, got %v", want, statuses)
   }
   for i, s := range want {
       if statuses[i] != s {
           t.Errorf("status[%d]: expected %q, got %q", i, s, statuses[i])
       }
   }
}