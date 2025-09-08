package colors

import (
   "reflect"
   "testing"
)

// TestServiceColors verifies the default service color palette.
func TestServiceColors(t *testing.T) {
   expected := []string{
       "#dc322f", // Solarized red
       "#859900", // Solarized green
       "#b58900", // Solarized yellow
       "#268bd2", // Solarized blue
       "#d33682", // Solarized magenta
       "#2aa198", // Solarized cyan
   }
   if !reflect.DeepEqual(ServiceColors, expected) {
       t.Errorf("ServiceColors mismatch: expected %v, got %v", expected, ServiceColors)
   }
}

// TestColorConstants verifies the TUI color constants have the correct values.
func TestColorConstants(t *testing.T) {
   tests := []struct {
       name     string
       got, want string
   }{
       {"Header", Header, "#61AFEF"},
       {"SelectedBackground", SelectedBackground, "#3E4451"},
       {"SelectedForeground", SelectedForeground, "#FFFFFF"},
       {"Pending", Pending, "#A0A1A7"},
       {"Running", Running, "#98C379"},
       {"Crashed", Crashed, "#E06C75"},
       {"Exited", Exited, "#61AFEF"},
       {"Healthy", Healthy, "#98C379"},
       {"Unhealthy", Unhealthy, "#E06C75"},
   }
   for _, tt := range tests {
       if tt.got != tt.want {
           t.Errorf("%s: expected %s, got %s", tt.name, tt.want, tt.got)
       }
   }
}