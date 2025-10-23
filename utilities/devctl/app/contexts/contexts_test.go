package contexts

import (
   "context"
   "testing"
)

// Test that the returned cancel function cancels the context
func TestWithSignalCancel_Cancel(t *testing.T) {
   parent := context.Background()
   ctx, cancel := WithSignalCancel(parent)
   cancel()
   select {
   case <-ctx.Done():
       // expected
   default:
       t.Error("expected context to be cancelled after cancel()")
   }
}