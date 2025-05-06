package runner

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"devctl/app/colors"
	"devctl/app/config"
	"devctl/app/health"
	"devctl/app/service"

	"github.com/charmbracelet/lipgloss"
)

// default health check settings (seconds)
const (
	defaultHealthInterval = 2
	defaultHealthTimeout  = 30
)

// Options configures a Runner.
type Options struct {
	ConfigDir             string
	Mode                  string
	Focus, Mute           string
	Colors                []string
	DefaultHealthInterval int
	DefaultHealthTimeout  int
	HTTPClient            health.HTTPClient
}

// Runner orchestrates services and health checks.
type Runner struct {
	opts Options
}

// NewRunner creates a Runner with provided options, filling defaults.
func New(opts Options) *Runner {
	if len(opts.Colors) == 0 {
		opts.Colors = colors.ServiceColors
	}
	if opts.DefaultHealthInterval <= 0 {
		opts.DefaultHealthInterval = defaultHealthInterval
	}
	if opts.DefaultHealthTimeout <= 0 {
		opts.DefaultHealthTimeout = defaultHealthTimeout
	}
	if opts.HTTPClient == nil {
		opts.HTTPClient = http.DefaultClient
	}
	return &Runner{opts: opts}
}

// Run executes the environment setup, starts services, performs health checks, and waits.
func (r *Runner) Run(ctx context.Context) error {
	// 1. Load environment variables from file and set in process environment
	//    - Attempt to read env file at ConfigDir for the given Mode
	//    - If file not found, warn and continue; on other errors, abort
	//    - On success, set each key/value in OS environment
	if envMap, err := config.LoadEnvFile(r.opts.ConfigDir, r.opts.Mode); err != nil {
		if os.IsNotExist(err) {
			fmt.Fprintf(os.Stderr, "Warning: env file not found, continuing without it\n")
		} else {
			return fmt.Errorf("loading env file: %w", err)
		}
	} else {
		for k, v := range envMap {
			os.Setenv(k, v)
		}
	}

	// 2. Load health check configuration
	//    - Read health entries from file under ConfigDir for Mode
	//    - If missing, warn and disable health checks; on other errors, abort
	hcMap, err := config.LoadHealthFile(r.opts.ConfigDir, r.opts.Mode)
	doHealth := true
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Fprintf(os.Stderr, "Warning: health file not found, skipping health checks\n")
			doHealth = false
		} else {
			return fmt.Errorf("loading health file: %w", err)
		}
	}

	// 3. Load service definitions from Procfile
	//    - Parse service commands and names; abort on error
	svcs, err := config.LoadProcfileFile(r.opts.ConfigDir, r.opts.Mode)
	if err != nil {
		return fmt.Errorf("loading procfile: %w", err)
	}

	// 4. Start all services concurrently
	//    - Launch each service as a subprocess
	//    - Stream stdout/stderr with coloring and filtering (focus/mute)
	var svcWg sync.WaitGroup
	svcWg.Add(len(svcs))
	for i, svc := range svcs {
		color := r.opts.Colors[i%len(r.opts.Colors)]
		go func(s config.ServiceConfig, color string) {
			defer svcWg.Done()
			r.startService(ctx, s, color)
		}(svc, color)
	}

	// 5. Perform health checks for services with entries
	//    - For each service with a health config, poll its URL until healthy or timeout
	//    - Wait for all health check goroutines to finish
	if doHealth {
		var hcWg sync.WaitGroup
		for i, svc := range svcs {
			if entry, ok := hcMap[svc.Name]; ok {
				color := r.opts.Colors[i%len(r.opts.Colors)]
				hcWg.Add(1)
				go func(name string, entry config.HealthEntry, color string) {
					defer hcWg.Done()
					r.startHealth(ctx, name, entry, color)
				}(svc.Name, entry, color)
			}
		}
		hcWg.Wait()
	}

	// 6. Wait for all service processes to exit before returning
	svcWg.Wait()
	return nil
}

func serviceTextHandler(svc config.ServiceConfig, color string) func(string) {
	// Prepare a lipgloss style for this service
	style := lipgloss.NewStyle().Foreground(lipgloss.Color(color))
	// Prefix each line with styled [service]
	return func(text string) {
		fmt.Println(style.Render("["+svc.Name+"]") + " " + text)
	}
}

// startService starts a service process and streams its output.
//   - Launches the command as a subprocess tied to the provided context (cancellable).
//   - Attaches to both stdout and stderr pipes.
//   - Processes each output line with service.ProcessStream (applying focus/mute filters).
//   - Prints each line prefixed with the service name and colored output.
//   - Waits for all output to be drained and the process to exit.
func (r *Runner) startService(ctx context.Context, svc config.ServiceConfig, color string) {
	textHandler := serviceTextHandler(svc, color)

	err := service.
		New().
		SetConfig(svc).
		SetStdOutCallback(textHandler).
		SetStdErrCallback(textHandler).
		SetFocus(r.opts.Focus).
		SetMute(r.opts.Mute).
		Start(ctx)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error for %s: %v\n", svc.Name, err)
	}
}

// startHealth performs health checks for a service until success, timeout, or context done.
//   - Reads or defaults the polling interval and timeout duration.
//   - Repeatedly invokes health.CheckStatus against the configured URL and expected codes.
//   - On first successful status, prints a success message and returns.
//   - If the timeout duration elapses, prints a failure message and returns.
//   - If the context is canceled, prints an aborted message and returns immediately.
func (r *Runner) startHealth(ctx context.Context, svcName string, entry config.HealthEntry, color string) {
	interval := entry.IntervalSeconds
	if interval <= 0 {
		interval = r.opts.DefaultHealthInterval
	}
	timeout := entry.TimeoutSeconds
	if timeout <= 0 {
		timeout = r.opts.DefaultHealthTimeout
	}
	start := time.Now()
	// Prepare a lipgloss style for health messages
	style := lipgloss.NewStyle().Foreground(lipgloss.Color(color))
	for {
		select {
		case <-ctx.Done():
			// Context canceled: abort health check
			fmt.Printf("%s aborted\n", style.Render(fmt.Sprintf("[health][%s]", svcName)))
			return
		default:
		}
		ok, code, err := health.CheckStatus(r.opts.HTTPClient, entry.URL, entry.Codes)
		if err == nil && ok {
			// Success
			fmt.Printf("%s success (%d)\n", style.Render(fmt.Sprintf("[health][%s]", svcName)), code)
			return
		}
		if time.Since(start) > time.Duration(timeout)*time.Second {
			// Timeout
			fmt.Printf("%s failure (timeout)\n", style.Render(fmt.Sprintf("[health][%s]", svcName)))
			return
		}
		time.Sleep(time.Duration(interval) * time.Second)
	}
}
