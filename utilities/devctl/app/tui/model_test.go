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

// TestNewModelWithFocus sets initial selection based on focus flag.
func TestNewModelWithFocus(t *testing.T) {
   services := []config.ServiceConfig{{Name: "a"}, {Name: "b"}, {Name: "c"}}
   // NewModel returns *model; svcFocus should be set, selection remains default 0
   mod := NewModel(services, nil, "b", "")
   if mod.svcFocus != "b" {
       t.Errorf("svcFocus: expected %q, got %q", "b", mod.svcFocus)
   }
   if mod.selected != 0 {
       t.Errorf("selected: expected default 0, got %d", mod.selected)
   }
}

// TestUpdateFocusFiltering ignores logs for services outside focus.
func TestUpdateFocusFiltering(t *testing.T) {
   services := []config.ServiceConfig{{Name: "a"}, {Name: "b"}}
   // focus on "a"
   var m tea.Model = NewModel(services, nil, "a", "")
   // Log for b should be ignored
   updated, _ := m.Update(LogMsg{Service: "b", Line: "ignored"})
   mod := updated.(*model)
   if len(mod.logs["b"]) != 0 {
       t.Errorf("focus filter: expected 0 logs for b, got %d", len(mod.logs["b"]))
   }
   // Log for a should be recorded
   updated, _ = updated.Update(LogMsg{Service: "a", Line: "ok"})
   mod = updated.(*model)
   if len(mod.logs["a"]) != 1 {
       t.Errorf("focus filter: expected 1 log for a, got %d", len(mod.logs["a"]))
   }
}

// TestUpdateMuteFiltering ignores logs and status updates for muted service.
func TestUpdateMuteFiltering(t *testing.T) {
   services := []config.ServiceConfig{{Name: "a"}, {Name: "b"}}
   // mute "b"
   var m tea.Model = NewModel(services, nil, "", "b")
   // Log for b should be ignored
   updated, _ := m.Update(LogMsg{Service: "b", Line: "ignored"})
   mod := updated.(*model)
   if len(mod.logs["b"]) != 0 {
       t.Errorf("mute filter: expected 0 logs for b, got %d", len(mod.logs["b"]))
   }
   // Status for b should be ignored
   initial := mod.statuses["b"]
   updated, _ = updated.Update(StatusMsg{Service: "b", Status: service.Statuses["Running"]})
   mod = updated.(*model)
   if mod.statuses["b"] != initial {
       t.Errorf("mute filter: expected status unchanged %q, got %q", initial, mod.statuses["b"])
   }
}

// TestNewModel initializes model and checks default state.
func TestNewModel(t *testing.T) {
   services := []config.ServiceConfig{{Name: "svc1"}, {Name: "svc2"}}
   hcMap := map[string]config.HealthEntry{"svc1": {URL: "u", Codes: []int{200}}}
   mod := NewModel(services, hcMap, "", "")
   // services list should match
   if !reflect.DeepEqual(mod.services, services) {
       t.Errorf("services mismatch: expected %v, got %v", services, mod.services)
   }
   // statuses should initialize to Pending
   for _, svc := range services {
       if mod.statuses[svc.Name] != service.Statuses["Pending"] {
           t.Errorf("expected status Pending for %s, got %s", svc.Name, mod.statuses[svc.Name])
       }
   }
   // logs should start empty
   for _, svc := range services {
       if len(mod.logs[svc.Name]) != 0 {
           t.Errorf("expected no logs for %s, got %d", svc.Name, len(mod.logs[svc.Name]))
       }
   }
}

// TestUpdate_LogMsg appends log lines and records them all.
func TestUpdate_LogMsg(t *testing.T) {
   services := []config.ServiceConfig{{Name: "s"}}
   // start with fresh model
   var m tea.Model = NewModel(services, nil, "", "")
   const total = 10
   // append several log lines
   for i := 0; i < total; i++ {
       m, _ = m.Update(LogMsg{Service: "s", Line: strings.Repeat("x", 1)})
   }
   mod := m.(*model)
   logs := mod.logs["s"]
   if len(logs) != total {
       t.Errorf("expected %d logs, got %d", total, len(logs))
   }
}

// TestUpdate_StatusMsg updates service status.
func TestUpdate_StatusMsg(t *testing.T) {
   services := []config.ServiceConfig{{Name: "s"}}
   var m tea.Model = NewModel(services, nil, "", "")
   updated, _ := m.Update(StatusMsg{Service: "s", Status: service.Statuses["Running"]})
   mod := updated.(*model)
   if mod.statuses["s"] != service.Statuses["Running"] {
       t.Errorf("expected status Running, got %s", mod.statuses["s"])
   }
}

// TestUpdate_KeyMsg navigates selection and quits.
func TestUpdate_KeyMsg(t *testing.T) {
   services := []config.ServiceConfig{{Name: "a"}, {Name: "b"}}
   var m tea.Model = NewModel(services, nil, "", "")
   // move down (j)
   updated, cmd := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'j'}})
   mod := updated.(*model)
   if mod.selected != 1 {
       t.Errorf("expected selected 1 after down key, got %d", mod.selected)
   }
   // move up (k)
   updated, _ = updated.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'k'}})
   mod = updated.(*model)
   if mod.selected != 0 {
       t.Errorf("expected selected 0 after up key, got %d", mod.selected)
   }
   // quit (q)
   _, cmd = updated.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}})
   if cmd == nil {
       t.Fatal("expected non-nil cmd for quit")
   }
   // executing cmd should return tea.Quit()
   msg := cmd()
   if msg != tea.Quit() {
       t.Errorf("expected Quit() message, got %v", msg)
   }
}

// TestView includes service names and logs for selected.
func TestView(t *testing.T) {
   services := []config.ServiceConfig{{Name: "x"}}
   // ensure View() returns help text without error
   var m tea.Model = NewModel(services, nil, "", "")
   v := m.View()
   if v == "" {
       t.Error("expected non-empty view output")
   }
   if !strings.Contains(v, "quit") {
       t.Errorf("expected help text in view, got %q", v)
   }
}