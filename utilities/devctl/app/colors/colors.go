package colors

// ServiceColors is the list of colors for Runner output (hex values).
var ServiceColors = []string{
   "#dc322f", // Solarized red
   "#859900", // Solarized green
   "#b58900", // Solarized yellow
   "#268bd2", // Solarized blue
   "#d33682", // Solarized magenta
   "#2aa198", // Solarized cyan
}

// TUI color constants (hex values).
const (
   Header             = "#61AFEF"
   SelectedBackground = "#3E4451"
   SelectedForeground = "#FFFFFF"
   Pending            = "#A0A1A7"
   Running            = "#98C379"
   Crashed            = "#E06C75"
   Exited             = "#61AFEF"
   Healthy            = "#98C379"
   Unhealthy          = "#E06C75"
)