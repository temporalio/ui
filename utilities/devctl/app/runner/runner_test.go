package runner

import (
   "bytes"
   "context"
   "io"
   "net/http"
   "os"
   "reflect"
   "strings"
   "testing"

   "devctl/app/colors"
   "devctl/app/config"
)

// captureOutput redirects the given std (os.Stdout or os.Stderr) while running f and returns captured data.
func captureOutput(std **os.File, f func()) string {
   // save original
   orig := *std
   r, w, err := os.Pipe()
   if err != nil {
       panic(err)
   }
   *std = w
   outC := make(chan string)
   go func() {
       var buf bytes.Buffer
       io.Copy(&buf, r)
       outC <- buf.String()
   }()
   f()
   w.Close()
   *std = orig
   return <-outC
}

// TestNew_Defaults ensures New sets default values when Options are zero.
func TestNew_Defaults(t *testing.T) {
   r := New(Options{})
   // Colors default
   if !reflect.DeepEqual(r.opts.Colors, colors.ServiceColors) {
       t.Errorf("expected default colors %v, got %v", colors.ServiceColors, r.opts.Colors)
   }
   // Health defaults
   if r.opts.DefaultHealthInterval != defaultHealthInterval {
       t.Errorf("expected DefaultHealthInterval %d, got %d", defaultHealthInterval, r.opts.DefaultHealthInterval)
   }
   if r.opts.DefaultHealthTimeout != defaultHealthTimeout {
       t.Errorf("expected DefaultHealthTimeout %d, got %d", defaultHealthTimeout, r.opts.DefaultHealthTimeout)
   }
   // HTTPClient default
   if r.opts.HTTPClient != http.DefaultClient {
       t.Errorf("expected default HTTPClient, got %v", r.opts.HTTPClient)
   }
}

// TestNew_PreservesCustom ensures New does not override provided Options.
func TestNew_PreservesCustom(t *testing.T) {
   customColors := []string{"#AAA"}
   customInterval := 5
   customTimeout := 10
   customClient := &http.Client{}
   opts := Options{
       Colors:                customColors,
       DefaultHealthInterval: customInterval,
       DefaultHealthTimeout:  customTimeout,
       HTTPClient:            customClient,
   }
   r := New(opts)
   if !reflect.DeepEqual(r.opts.Colors, customColors) {
       t.Errorf("expected colors %v, got %v", customColors, r.opts.Colors)
   }
   if r.opts.DefaultHealthInterval != customInterval {
       t.Errorf("expected DefaultHealthInterval %d, got %d", customInterval, r.opts.DefaultHealthInterval)
   }
   if r.opts.DefaultHealthTimeout != customTimeout {
       t.Errorf("expected DefaultHealthTimeout %d, got %d", customTimeout, r.opts.DefaultHealthTimeout)
   }
   if r.opts.HTTPClient != customClient {
       t.Errorf("expected HTTPClient %v, got %v", customClient, r.opts.HTTPClient)
   }
}

// TestServiceTextHandler prints prefixed and suffixed text to stdout.
func TestServiceTextHandler(t *testing.T) {
   svc := config.ServiceConfig{Name: "svcX", Cmd: ""}
   handler := serviceTextHandler(svc, "#FF0000")
   out := captureOutput(&os.Stdout, func() {
       handler("hello world")
   })
   if !strings.Contains(out, "hello world") {
       t.Errorf("expected output to contain text, got %q", out)
   }
   if !strings.Contains(out, "] hello world") {
       t.Errorf("expected prefix and text, got %q", out)
   }
}

// TestRun_ProcfileNotExist verifies Runner.Run prints warnings and errors on missing files.
func TestRun_ProcfileNotExist(t *testing.T) {
   dir := t.TempDir()
   r := New(Options{ConfigDir: dir, Mode: "m"})
   errOut := captureOutput(&os.Stderr, func() {
       err := r.Run(context.Background())
       if err == nil || !strings.Contains(err.Error(), "loading procfile") {
           t.Errorf("expected loading procfile error, got %v", err)
       }
   })
   if !strings.Contains(errOut, "Warning: env file not found") {
       t.Errorf("expected env warning, got %q", errOut)
   }
   if !strings.Contains(errOut, "Warning: health file not found") {
       t.Errorf("expected health warning, got %q", errOut)
   }
}

// fakeClient always returns success with 200.
type fakeClientOK struct{}
func (f *fakeClientOK) Get(url string) (*http.Response, error) {
   return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(""))}, nil
}

// TestStartHealth_Aborted ensures startHealth respects context cancellation.
func TestStartHealth_Aborted(t *testing.T) {
   r := New(Options{})
   ctx, cancel := context.WithCancel(context.Background())
   cancel()
   entry := config.HealthEntry{URL: "", Codes: []int{200}, IntervalSeconds: 1, TimeoutSeconds: 1}
   out := captureOutput(&os.Stdout, func() {
       r.startHealth(ctx, "svc", entry, "#000")
   })
   if !strings.Contains(out, "aborted") {
       t.Errorf("expected aborted message, got %q", out)
   }
}

// TestStartHealth_Success ensures startHealth reports success on HTTP 200.
func TestStartHealth_Success(t *testing.T) {
   fake := &fakeClientOK{}
   r := New(Options{HTTPClient: fake})
   entry := config.HealthEntry{URL: "http://x", Codes: []int{200}, IntervalSeconds: 1, TimeoutSeconds: 1}
   out := captureOutput(&os.Stdout, func() {
       r.startHealth(context.Background(), "svc", entry, "#000")
   })
   if !strings.Contains(out, "success (200)") {
       t.Errorf("expected success message, got %q", out)
   }
}