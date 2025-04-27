package tui

import (
	"devctl/app/colors"
	"devctl/app/config"
	"devctl/app/service"
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
	lipgloss "github.com/charmbracelet/lipgloss"
)

var (
	headerStyle = lipgloss.NewStyle().
			Bold(true).
			Underline(true).
			Foreground(lipgloss.Color(colors.Header))

	selectedStyle = lipgloss.NewStyle().
			Bold(true).
			Background(lipgloss.Color(colors.SelectedBackground)).
			Foreground(lipgloss.Color(colors.SelectedForeground))

	pendingStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color(colors.Pending))
	runningStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color(colors.Running))
	crashedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color(colors.Crashed))
	exitedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color(colors.Exited))
	healthyStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color(colors.Healthy))
	unhealthyStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color(colors.Unhealthy))
)

// styleStatus colors a service status string.
func styleStatus(status string) string {
	var s lipgloss.Style
	switch status {
	case service.Statuses["Pending"]:
		s = pendingStyle
	case service.Statuses["Running"], service.Statuses["Starting"]:
		s = runningStyle
	case service.Statuses["Healthy"]:
		s = healthyStyle
	case service.Statuses["Unhealthy"], service.Statuses["Restarting"], service.Statuses["Stopping"]:
		s = crashedStyle
	case service.Statuses["Exited"]:
		s = exitedStyle
	default:
		s = pendingStyle
	}
	return s.Render(status)
}

// MaxLogLines is the maximum number of log lines to keep per service.
const MaxLogLines = 100

// LogMsg carries a single log line from a service.
type LogMsg struct {
	Service string
	Line    string
}

// StatusMsg updates the status of a service.
type StatusMsg struct {
	Service string
	Status  string
}

// model implements the Bubble Tea model for the TUI.
type model struct {
	services []config.ServiceConfig
	hcMap    map[string]config.HealthEntry
	statuses map[string]string
	logs     map[string][]string
	selected int
	focus    string
	mute     string
}

// NewModel creates a new TUI model with the given services and health config.
func NewModel(services []config.ServiceConfig, hcMap map[string]config.HealthEntry, focus, mute string) tea.Model {
	statuses := make(map[string]string)
	logs := make(map[string][]string)
	for _, svc := range services {
		statuses[svc.Name] = "Pending"
		logs[svc.Name] = []string{}
	}
	return &model{
		services: services,
		hcMap:    hcMap,
		statuses: statuses,
		logs:     logs,
		selected: 0,
		focus:    focus,
		mute:     mute,
	}
}

// Init is called when the TUI starts; no initial commands.
func (m *model) Init() tea.Cmd {
	return nil
}

// Update handles incoming messages (logs, status updates, key presses).
func (m *model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case LogMsg:
		lines := m.logs[msg.Service]
		lines = append(lines, msg.Line)
		if len(lines) > MaxLogLines {
			lines = lines[len(lines)-MaxLogLines:]
		}
		m.logs[msg.Service] = lines
		return m, nil
	case StatusMsg:
		m.statuses[msg.Service] = msg.Status
		return m, nil
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "up", "k":
			if m.selected > 0 {
				m.selected--
			}
			return m, nil
		case "down", "j":
			if m.selected < len(m.services)-1 {
				m.selected++
			}
			return m, nil
		}
	}
	return m, nil
}

// View renders the UI: list of services and logs for the selected one.
func (m *model) View() string {
	s := headerStyle.Render("Services:") + "\n"
	for i, svc := range m.services {
		prefix := "  "
		if i == m.selected {
			prefix = "> "
		}
		status := m.statuses[svc.Name]
		coloredStatus := styleStatus(status)
		line := fmt.Sprintf("%s%s [%s]", prefix, svc.Name, coloredStatus)
		if i == m.selected {
			line = selectedStyle.Render(line)
		}
		s += line + "\n"
	}
	s += "\n" + headerStyle.Render("Logs:") + "\n"
	selected := m.services[m.selected].Name
	for _, line := range m.logs[selected] {
		s += line + "\n"
	}
	s += "\n(q to quit)"
	return s
}
