package runner

import (
   "bytes"
   "context"
   "io"
   "os"
   "path/filepath"
   "strings"
   "testing"
)

// captureStderr redirects os.Stderr for the duration of f and returns the captured output.
func captureStderr(f func()) string {
   // Redirect stderr to a pipe
   orig := os.Stderr
   r, w, _ := os.Pipe()
   os.Stderr = w
   // Run the function
   f()
   // Restore stderr and close writer to unblock reader
   w.Close()
   os.Stderr = orig
   // Read any output
   var buf bytes.Buffer
   io.Copy(&buf, r)
   return buf.String()
}

// TestRun_Warnings verifies that missing env and health files emit warnings but do not abort.
func TestRun_Warnings(t *testing.T) {
   dir := t.TempDir()
   // Create a minimal Procfile.test so Run will proceed
   proc := "svc: true\n"
   f := filepath.Join(dir, "Procfile.test")
   if err := os.WriteFile(f, []byte(proc), 0644); err != nil {
       t.Fatalf("writing Procfile: %v", err)
   }
   r := New(Options{ConfigDir: dir, Mode: "test"})
   stderr := captureStderr(func() {
       if err := r.Run(context.Background()); err != nil {
           t.Fatalf("expected no error, got %v", err)
       }
   })
   if !strings.Contains(stderr, "Warning: env file not found") {
       t.Errorf("expected env warning, got %q", stderr)
   }
   if !strings.Contains(stderr, "Warning: health file not found") {
       t.Errorf("expected health warning, got %q", stderr)
   }
}

// TestRun_SetsEnvVars verifies that a valid .env.<mode> file sets environment variables.
func TestRun_SetsEnvVars(t *testing.T) {
   dir := t.TempDir()
   // Write env file
   envContent := "FOO=bar\nBAZ=qux\n"
   if err := os.WriteFile(filepath.Join(dir, ".env.test"), []byte(envContent), 0644); err != nil {
       t.Fatalf("writing env file: %v", err)
   }
   // Write Procfile.test
   proc := "svc: true\n"
   if err := os.WriteFile(filepath.Join(dir, "Procfile.test"), []byte(proc), 0644); err != nil {
       t.Fatalf("writing Procfile: %v", err)
   }
   // Ensure vars are unset before Run
   os.Unsetenv("FOO")
   os.Unsetenv("BAZ")
   r := New(Options{ConfigDir: dir, Mode: "test"})
   if err := r.Run(context.Background()); err != nil {
       t.Fatalf("expected no error, got %v", err)
   }
   if got := os.Getenv("FOO"); got != "bar" {
       t.Errorf("FOO: expected 'bar', got %q", got)
   }
   if got := os.Getenv("BAZ"); got != "qux" {
       t.Errorf("BAZ: expected 'qux', got %q", got)
   }
}

// TestRun_ErrorOnBadEnvFile verifies that a malformed env file causes Run to abort.
func TestRun_ErrorOnBadEnvFile(t *testing.T) {
   dir := t.TempDir()
   // Write bad env file
   if err := os.WriteFile(filepath.Join(dir, ".env.test"), []byte("BADLINE"), 0644); err != nil {
       t.Fatalf("writing bad env file: %v", err)
   }
   // Minimal Procfile
   if err := os.WriteFile(filepath.Join(dir, "Procfile.test"), []byte("svc: true"), 0644); err != nil {
       t.Fatalf("writing Procfile: %v", err)
   }
   r := New(Options{ConfigDir: dir, Mode: "test"})
   err := r.Run(context.Background())
   if err == nil || !strings.Contains(err.Error(), "loading env file") {
       t.Errorf("expected loading env file error, got %v", err)
   }
}

// TestRun_ErrorOnMissingProcfile verifies that missing Procfile aborts Run with an error.
func TestRun_ErrorOnMissingProcfile(t *testing.T) {
   dir := t.TempDir()
   r := New(Options{ConfigDir: dir, Mode: "test"})
   err := r.Run(context.Background())
   if err == nil || !strings.Contains(err.Error(), "loading procfile") {
       t.Errorf("expected loading procfile error, got %v", err)
   }
}