package tui

import (
	"fmt"
	"strings"

	"devctl/app/colors"
	"devctl/app/config"
	"devctl/app/service"

	"github.com/charmbracelet/bubbles/help"
	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	sidebarWidth = 24

	sidebarStyle = lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color("240")).
			Width(sidebarWidth).Align(lipgloss.Top)

	sidebarFocusedStyle = sidebarStyle.
				BorderForeground(lipgloss.Color("62")) // blue border when focused

	contentStyle = lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color("240")).Align(lipgloss.Top)

	contentFocusedStyle = contentStyle.
				BorderForeground(lipgloss.Color("62")) // blue border when focused

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

type model struct {
	keys keyMap
	help help.Model

	services []config.ServiceConfig
	logs     map[string][]string
	statuses map[string]string

	selected int
	sidebar  viewport.Model
	content  viewport.Model
	width    int
	height   int

	viewFocus string // "sidebar" or "content"
	svcFocus  string
	svcMute   string
}

func NewModel(
	services []config.ServiceConfig,
	hcMap map[string]config.HealthEntry,
	focus, mute string,
) *model {
	side := viewport.New(0, 0)
	main := viewport.New(0, 0)
	main.SetHorizontalStep(1)

	logs := make(map[string][]string)
	statuses := make(map[string]string)

	for _, svc := range services {
		statuses[svc.Name] = "Pending"
		logs[svc.Name] = []string{}
	}

	m := &model{
		keys: keys,
		help: help.New(),

		services: services,
		logs:     logs,
		statuses: statuses,

		sidebar:   side,
		content:   main,
		svcFocus:  focus,
		svcMute:   mute,
		viewFocus: "sidebar",
	}

	side.SetContent(m.sidebarContent())
	main.SetContent("")

	return m
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m *model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case LogMsg:
		// filters
		if m.svcFocus != "" && msg.Service != m.svcFocus {
			return m, nil
		}
		if m.svcMute != "" && msg.Service == m.svcMute {
			return m, nil
		}
		// append log and keep last N
		lines := m.logs[msg.Service]
		lines = append(lines, msg.Line)
		m.logs[msg.Service] = lines
		// if for selected service, update viewport
		if msg.Service == m.services[m.selected].Name {
			m.content.SetContent(strings.Join(lines, "\n"))
			m.content.GotoBottom()
		}
		return m, nil

	case StatusMsg:
		if m.svcFocus != "" && msg.Service != m.svcFocus {
			return m, nil
		}
		if m.svcMute != "" && msg.Service == m.svcMute {
			return m, nil
		}
		m.statuses[msg.Service] = msg.Status
		m.sidebar.SetContent(m.sidebarContent())
		return m, nil
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		m.sidebar.Width = sidebarWidth
		m.sidebar.Height = m.height - 3

		m.content.Width = m.width - lipgloss.Width(m.sidebar.View()) - 4
		m.content.Height = m.height - 3

	case tea.KeyMsg:
		switch {

		case key.Matches(msg, m.keys.Quit):
			return m, tea.Quit

		case key.Matches(msg, m.keys.Up):
			if m.viewFocus == "sidebar" {
				if m.selected > 0 {
					m.selected--
				}
				// load new logs
				svc := m.services[m.selected].Name
				m.content.SetContent(strings.Join(m.logs[svc], "\n"))
				m.content.GotoBottom()
				m.sidebar.SetContent(m.sidebarContent())
				return m, nil
			}

		case key.Matches(msg, m.keys.Down):
			if m.viewFocus == "sidebar" {
				if m.selected < len(m.services)-1 {
					m.selected++
				}
				svc := m.services[m.selected].Name
				m.content.SetContent(strings.Join(m.logs[svc], "\n"))
				m.content.GotoBottom()
				m.sidebar.SetContent(m.sidebarContent())
				return m, nil
			}

		case key.Matches(msg, m.keys.Left):
			m.content.ScrollLeft(m.content.Width)

		case key.Matches(msg, m.keys.Right):
			m.content.ScrollRight(m.content.Width)

		case key.Matches(msg, m.keys.Tab):
			if m.viewFocus == "sidebar" {
				m.viewFocus = "content"
			} else {
				m.viewFocus = "sidebar"
			}
		}
	}

	// Update focused viewport
	if m.viewFocus == "sidebar" {
		var cmd tea.Cmd
		m.sidebar, cmd = m.sidebar.Update(msg)
		cmds = append(cmds, cmd)
	} else {
		var cmd tea.Cmd
		m.content, cmd = m.content.Update(msg)
		cmds = append(cmds, cmd)
	}

	return m, tea.Batch(cmds...)
}

func (m model) View() string {
	side := sidebarStyle.Render(m.sidebar.View())
	content := contentStyle.Render(m.content.View())

	// Highlight focused section
	if m.viewFocus == "sidebar" {
		side = sidebarFocusedStyle.Render(m.sidebar.View())
	} else {
		content = contentFocusedStyle.Render(m.content.View())
	}

	page := lipgloss.JoinHorizontal(
		lipgloss.Top,
		side,
		content,
	)
	page += "\n" + m.help.View(m.keys)

	return page
}

func (m *model) sidebarContent() string {
	content := ""

	for i, svc := range m.services {
		prefix := "  "
		if i == m.selected {
			prefix = "> "
		}
		status := styleStatus(m.statuses[svc.Name])
		text := fmt.Sprintf("%s%s [%s]", prefix, svc.Name, status)
		if i == m.selected {
			text = selectedStyle.Render(text)
		}

		content += text + "\n"
	}

	return content
}

// Get current "selected" line based on sidebar scroll position
func currentSidebarLine(m *model) string {
	lines := strings.Split(m.sidebarContent(), "\n")
	m.selected = m.selected + 1

	if (len(lines) - 1) < m.selected {
		m.selected = 0
		return "Home"
	}

	return lines[m.selected]
}

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
