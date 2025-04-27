package config

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// ServiceConfig holds the name and command for a service.
type ServiceConfig struct {
	Name string
	Cmd  string
}

// HealthEntry defines a health check configuration for a service.
type HealthEntry struct {
	URL             string
	Codes           []int
	IntervalSeconds int
	TimeoutSeconds  int
}

// ParseEnv parses key=value lines from r. Lines starting with # or empty are skipped.
func ParseEnv(r io.Reader) (map[string]string, error) {
	m := make(map[string]string)
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			return nil, fmt.Errorf("invalid env line: %s", line)
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		m[key] = val
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return m, nil
}

// LoadEnvFile opens configs/.env.<mode> and parses it.
func LoadEnvFile(configDir, mode string) (map[string]string, error) {
	path := filepath.Join(configDir, fmt.Sprintf(".env.%s", mode))
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return ParseEnv(f)
}

// ParseProcfile parses lines of the form name: command from r.
func ParseProcfile(r io.Reader) ([]ServiceConfig, error) {
	var svcs []ServiceConfig
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			return nil, fmt.Errorf("invalid procfile line: %s", line)
		}
		name := strings.TrimSpace(parts[0])
		cmd := strings.TrimSpace(parts[1])
		svcs = append(svcs, ServiceConfig{Name: name, Cmd: cmd})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return svcs, nil
}

// LoadProcfileFile opens configs/Procfile.<mode> and parses it.
func LoadProcfileFile(configDir, mode string) ([]ServiceConfig, error) {
	path := filepath.Join(configDir, fmt.Sprintf("Procfile.%s", mode))
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return ParseProcfile(f)
}

// ParseHealth parses a simple YAML-like healthcheck: service: then indented key: value lines.
func ParseHealth(r io.Reader) (map[string]HealthEntry, error) {
	hc := make(map[string]HealthEntry)
	scanner := bufio.NewScanner(r)
	var current string
	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		// New service block
		if !strings.HasPrefix(line, " ") && strings.HasSuffix(trimmed, ":") {
			current = strings.TrimSuffix(trimmed, ":")
			hc[current] = HealthEntry{}
			continue
		}
		if current == "" {
			continue
		}
		parts := strings.SplitN(trimmed, ":", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		entry := hc[current]
		switch key {
		case "url":
			entry.URL = val
		case "codes":
			vals := strings.Trim(val, "[]")
			for _, p := range strings.Split(vals, ",") {
				p = strings.TrimSpace(p)
				if p == "" {
					continue
				}
				if c, err := strconv.Atoi(p); err == nil {
					entry.Codes = append(entry.Codes, c)
				}
			}
		case "interval_seconds":
			if n, err := strconv.Atoi(val); err == nil {
				entry.IntervalSeconds = n
			}
		case "timeout_seconds":
			if n, err := strconv.Atoi(val); err == nil {
				entry.TimeoutSeconds = n
			}
		}
		hc[current] = entry
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return hc, nil
}

// LoadHealthFile opens configs/healthcheck.<mode>.yaml and parses it.
func LoadHealthFile(configDir, mode string) (map[string]HealthEntry, error) {
	path := filepath.Join(configDir, fmt.Sprintf("healthcheck.%s.yaml", mode))
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return ParseHealth(f)
}

