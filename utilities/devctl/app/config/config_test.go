package config

import (
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

