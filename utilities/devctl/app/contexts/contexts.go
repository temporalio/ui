package contexts

import (
	"context"
	"os"
	"os/signal"
	"syscall"
)

// WithSignalCancel returns a context that is canceled on SIGINT or SIGTERM.
func WithSignalCancel(parent context.Context) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(parent)
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, os.Interrupt, syscall.SIGINT)
	go func() {
		select {
		case <-sigs:
			cancel()
		case <-ctx.Done():
		}
	}()
	return ctx, cancel
}
