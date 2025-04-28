package cmd

import (
   "errors"
   "flag"
   "os"
   "path/filepath"
   "testing"

   cli "github.com/urfave/cli/v2"
)

// makeContext builds a cli.Context with provided flag values.
// makeContext builds a cli.Context with provided flag values, including --no-tui.
func makeContext(configDir, mode, focus, mute string, noTUI bool) *cli.Context {
   app := &cli.App{}
   set := flag.NewFlagSet("test", flag.ContinueOnError)
   set.String("config-dir", "", "")
   set.String("mode", "", "")
   set.String("focus", "", "")
   set.String("mute", "", "")
   set.Bool("no-tui", false, "")
   // Build args
   args := []string{"--config-dir", configDir, "--mode", mode}
   if focus != "" {
       args = append(args, "--focus", focus)
   }
   if mute != "" {
       args = append(args, "--mute", mute)
   }
   if noTUI {
       args = append(args, "--no-tui")
   }
   set.Parse(args)
   return cli.NewContext(app, set, nil)
}

// suppressOutput silences stdout and stderr during f.
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

// TestAction_Success ensures action returns nil when config and Procfile exist.
func TestAction_Success(t *testing.T) {
   dir := t.TempDir()
   // write env file
   if err := os.WriteFile(filepath.Join(dir, ".env.test"), []byte("X=1\n"), 0644); err != nil {
       t.Fatalf("writing env file: %v", err)
   }
   // write Procfile
   if err := os.WriteFile(filepath.Join(dir, "Procfile.test"), []byte("svc: echo ok\n"), 0644); err != nil {
       t.Fatalf("writing Procfile: %v", err)
   }
   // disable TUI to run services directly
   c := makeContext(dir, "test", "", "", true)
   suppressOutput(func() {
       if err := action(c); err != nil {
           t.Fatalf("expected no error, got %v", err)
       }
   })
}

// TestAction_ProcfileMissing ensures action returns ExitCoder when Procfile is absent.
func TestAction_ProcfileMissing(t *testing.T) {
   dir := t.TempDir()
   // disable TUI to run services directly
   c := makeContext(dir, "test", "", "", true)
   var exitCoder cli.ExitCoder
   suppressOutput(func() {
       err := action(c)
       if !errors.As(err, &exitCoder) {
           t.Fatalf("expected ExitCoder, got %v", err)
       }
       if exitCoder.ExitCode() != 1 {
           t.Errorf("expected exit code 1, got %d", exitCoder.ExitCode())
       }
   })
}