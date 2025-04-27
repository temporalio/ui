package tui

import (
   "reflect"
   "strings"
   "testing"

   tea "github.com/charmbracelet/bubbletea"

   "devctl/app/config"
   "devctl/app/service"
)

// TestStyleStatus ensures styleStatus renders the status text.
func TestStyleStatus(t *testing.T) {
   for _, status := range service.Statuses {
       out := styleStatus(status)
       if !strings.Contains(out, status) {
           t.Errorf("styled status %q missing in output %q", status, out)
       }
   }
}

// TestNewModel initializes model and checks default state.
func TestNewModel(t *testing.T) {
   services := []config.ServiceConfig{{Name: "svc1"}, {Name: "svc2"}}
   hcMap := map[string]config.HealthEntry{"svc1": {URL: "u", Codes: []int{200}}}
   m := NewModel(services, hcMap, "", "")
   mod, ok := m.(*model)
   if !ok {
       t.Fatalf("expected *model, got %T", m)
   }
   if !reflect.DeepEqual(mod.services, services) {
       t.Errorf("services mismatch: got %v", mod.services)
   }
   // statuses should initialize to Pending
   for _, svc := range services {
       if mod.statuses[svc.Name] != service.Statuses["Pending"] {
           t.Errorf("expected status Pending for %s, got %s", svc.Name, mod.statuses[svc.Name])
       }
   }
   // logs should be empty slices
   for _, svc := range services {
       if len(mod.logs[svc.Name]) != 0 {
           t.Errorf("expected no logs for %s, got %v", svc.Name, mod.logs[svc.Name])
       }
   }
}

// TestUpdate_LogMsg appends log lines and enforces MaxLogLines.
func TestUpdate_LogMsg(t *testing.T) {
   services := []config.ServiceConfig{{Name: "s"}}
   m := NewModel(services, nil, "", "")
   // exceed MaxLogLines
   total := MaxLogLines + 5
   for i := 0; i < total; i++ {
       m, _ = m.Update(LogMsg{Service: "s", Line: strings.Repeat("x", 1)})
   }
   mod := m.(*model)
   logs := mod.logs["s"]
   if len(logs) != MaxLogLines {
       t.Errorf("expected %d logs, got %d", MaxLogLines, len(logs))
   }
}

// TestUpdate_StatusMsg updates service status.
func TestUpdate_StatusMsg(t *testing.T) {
   services := []config.ServiceConfig{{Name: "s"}}
   m := NewModel(services, nil, "", "")
   m, _ = m.Update(StatusMsg{Service: "s", Status: service.Statuses["Running"]})
   mod := m.(*model)
   if mod.statuses["s"] != service.Statuses["Running"] {
       t.Errorf("expected status Running, got %s", mod.statuses["s"])
   }
}

// TestUpdate_KeyMsg navigates selection and quits.
func TestUpdate_KeyMsg(t *testing.T) {
   services := []config.ServiceConfig{{Name: "a"}, {Name: "b"}}
   m := NewModel(services, nil, "", "")
   // move down
   m, cmd := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'j'}})
   mod := m.(*model)
   if mod.selected != 1 {
       t.Errorf("expected selected 1, got %d", mod.selected)
   }
   // move up
   m, cmd = m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'k'}})
   mod = m.(*model)
   if mod.selected != 0 {
       t.Errorf("expected selected 0, got %d", mod.selected)
   }
   // quit
   _, cmd = m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}})
   if cmd == nil {
       t.Fatal("expected non-nil cmd for quit")
   }
   // executing cmd should return tea.Quit()
   msg := cmd()
   expected := tea.Quit()
   if msg != expected {
       t.Errorf("expected Quit() message %v, got %v", expected, msg)
   }
}

// TestView includes service names and logs for selected.
func TestView(t *testing.T) {
   services := []config.ServiceConfig{{Name: "x"}}
   m := NewModel(services, nil, "", "")
   // add a log
   m, _ = m.Update(LogMsg{Service: "x", Line: "hello"})
   v := m.View()
   if !strings.Contains(v, "x") {
       t.Errorf("view missing service name: %s", v)
   }
   if !strings.Contains(v, "hello") {
       t.Errorf("view missing log line: %s", v)
   }
}