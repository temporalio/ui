package tui

import (
   "os"
   "strings"
   "testing"
)

// TestRun_ProcfileMissing ensures Run returns an error when the Procfile is absent.
func TestRun_ProcfileMissing(t *testing.T) {
   dir := t.TempDir()
   // No Procfile.test present
   err := Run(dir, "test", "", "")
   if err == nil {
       t.Fatal("expected error when Procfile is missing, got nil")
   }
   if !os.IsNotExist(errorsUnwrapped(err)) && !contains(err.Error(), "error loading Procfile") {
       t.Errorf("expected a procfile loading error, got %v", err)
   }
}

// errorsUnwrapped attempts to unwrap the error to the underlying cause.
func errorsUnwrapped(err error) error {
   for {
       unwrapped := unwrap(err)
       if unwrapped == nil {
           return err
       }
       err = unwrapped
   }
}

// unwrap tries standard unwrapping via interface.
func unwrap(err error) error {
   type unwrapper interface{ Unwrap() error }
   if u, ok := err.(unwrapper); ok {
       return u.Unwrap()
   }
   return nil
}

// contains is a simple substring check.
func contains(s, substr string) bool {
   return strings.Contains(s, substr)
}