package config

import (
   "os"
   "path/filepath"
   "strings"
   "testing"
)

func TestParseEnv(t *testing.T) {
	input := `# comment
KEY1=val1
KEY2 = val2

INVALID
KEY3=val3`
	r := strings.NewReader(input)
	env, err := ParseEnv(r)
	if err == nil {
		t.Fatal("expected error on invalid line, got nil")
	}
	// Remove invalid line and test success
	input = `# comment
KEY1=val1
KEY2 = val2
KEY3=val3`
	r = strings.NewReader(input)
	env, err = ParseEnv(r)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if env["KEY1"] != "val1" || env["KEY2"] != "val2" || env["KEY3"] != "val3" {
		t.Errorf("unexpected env map: %v", env)
	}
}

// Test loading environment file from disk
func TestLoadEnvFile(t *testing.T) {
   dir := t.TempDir()
   content := "A=1\nB=2\n"
   fname := filepath.Join(dir, ".env.test")
   if err := os.WriteFile(fname, []byte(content), 0644); err != nil {
       t.Fatalf("writing env file: %v", err)
   }
   env, err := LoadEnvFile(dir, "test")
   if err != nil {
       t.Fatalf("unexpected error: %v", err)
   }
   if env["A"] != "1" || env["B"] != "2" {
       t.Errorf("unexpected env map: %v", env)
   }
}

func TestLoadEnvFile_NotExist(t *testing.T) {
   dir := t.TempDir()
   _, err := LoadEnvFile(dir, "nope")
   if !os.IsNotExist(err) {
       t.Errorf("expected IsNotExist error, got: %v", err)
   }
}

// Test loading Procfile from disk
func TestLoadProcfileFile(t *testing.T) {
   dir := t.TempDir()
   content := "web: run-web\nworker: run-worker\n"
   fname := filepath.Join(dir, "Procfile.test")
   if err := os.WriteFile(fname, []byte(content), 0644); err != nil {
       t.Fatalf("writing procfile: %v", err)
   }
   svcs, err := LoadProcfileFile(dir, "test")
   if err != nil {
       t.Fatalf("unexpected error: %v", err)
   }
   if len(svcs) != 2 {
       t.Fatalf("expected 2 services, got %d", len(svcs))
   }
   if svcs[0].Name != "web" || svcs[0].Cmd != "run-web" {
       t.Errorf("unexpected svc[0]: %v", svcs[0])
   }
}

func TestLoadProcfileFile_NotExist(t *testing.T) {
   dir := t.TempDir()
   _, err := LoadProcfileFile(dir, "nope")
   if !os.IsNotExist(err) {
       t.Errorf("expected IsNotExist error, got: %v", err)
   }
}

// Test loading health configuration from disk
func TestLoadHealthFile(t *testing.T) {
   dir := t.TempDir()
   content := "svc1:\n  url: http://x\n  codes: [200]\n"
   fname := filepath.Join(dir, "healthcheck.test.yaml")
   if err := os.WriteFile(fname, []byte(content), 0644); err != nil {
       t.Fatalf("writing health file: %v", err)
   }
   hc, err := LoadHealthFile(dir, "test")
   if err != nil {
       t.Fatalf("unexpected error: %v", err)
   }
   entry, ok := hc["svc1"]
   if !ok {
       t.Fatalf("missing entry for svc1")
   }
   if entry.URL != "http://x" || len(entry.Codes) != 1 || entry.Codes[0] != 200 {
       t.Errorf("unexpected health entry: %+v", entry)
   }
}

func TestLoadHealthFile_NotExist(t *testing.T) {
   dir := t.TempDir()
   _, err := LoadHealthFile(dir, "nope")
   if !os.IsNotExist(err) {
       t.Errorf("expected IsNotExist error, got: %v", err)
   }
}

func TestParseProcfile(t *testing.T) {
	input := `web: run-web
worker:run-worker
invalid line
`
	r := strings.NewReader(input)
	svcs, err := ParseProcfile(r)
	if err == nil {
		t.Fatal("expected error on invalid line, got nil")
	}
	// Valid input
	input = `web: run-web
worker: run-worker
`
	r = strings.NewReader(input)
	svcs, err = ParseProcfile(r)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(svcs) != 2 {
		t.Fatalf("expected 2 services, got %d", len(svcs))
	}
	if svcs[0].Name != "web" || svcs[0].Cmd != "run-web" {
		t.Errorf("unexpected svc[0]: %v", svcs[0])
	}
}

func TestParseHealth(t *testing.T) {
	input := `svc1:
  url: http://localhost
  codes: [200,201]
  interval_seconds: 5
svc2:
  url: http://example.com
  codes: [500]
`
	r := strings.NewReader(input)
	hc, err := ParseHealth(r)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(hc) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(hc))
	}
	e1 := hc["svc1"]
	if e1.URL != "http://localhost" {
		t.Errorf("svc1 URL: %s", e1.URL)
	}
	if len(e1.Codes) != 2 || e1.Codes[0] != 200 || e1.Codes[1] != 201 {
		t.Errorf("svc1 Codes: %v", e1.Codes)
	}
	if e1.IntervalSeconds != 5 {
		t.Errorf("svc1 Interval: %d", e1.IntervalSeconds)
	}
	e2 := hc["svc2"]
	if e2.URL != "http://example.com" || len(e2.Codes) != 1 || e2.Codes[0] != 500 {
		t.Errorf("svc2 entry: %+v", e2)
	}
}

