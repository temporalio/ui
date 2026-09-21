package nlsearch

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/temporalio/ui-server/v2/server/typesafe"
)

// Sunday 2026-09-20, 11:04 in a UTC-4 zone.
var testNow = time.Date(2026, time.September, 20, 15, 4, 5, 0, time.UTC)

const newYorkOffset = -240

var testSearchAttributes = map[string]string{
	"WorkflowType": "Keyword",
	"WorkflowId":   "Keyword",
	"RunId":        "Keyword",
	"CustomerTier": "Keyword",
	"IsVip":        "Bool",
	"Attempts":     "Int",
}

// sentRequest is a request as the fake TypeSafe server receives it.
type sentRequest struct {
	Model     string         `json:"model"`
	State     map[string]any `json:"state"`
	Questions map[string]struct {
		Type         string         `json:"type"`
		Instructions string         `json:"instructions"`
		Criteria     map[string]any `json:"criteria"`
	} `json:"questions"`
}

func (r sentRequest) options(id string) []string {
	var out []string
	for key := range r.Questions[id].Criteria {
		out = append(out, key)
	}
	return out
}

// fakeTypeSafe answers "no" to each question unless the test gives an answer for the
// question id. An answer in checked must select an option that the request has.
// An answer in unchecked goes back as it is.
type fakeTypeSafe struct {
	t         *testing.T
	status    int
	checked   map[string]typesafe.Answer
	unchecked map[string]typesafe.Answer
	requests  []sentRequest
	bodySizes []int
}

func (f *fakeTypeSafe) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if f.status != 0 {
		w.WriteHeader(f.status)
		return
	}

	body, _ := io.ReadAll(r.Body)
	var req sentRequest
	if err := json.Unmarshal(body, &req); err != nil {
		f.t.Errorf("fake TypeSafe: bad request body: %v", err)
	}
	f.requests = append(f.requests, req)
	f.bodySizes = append(f.bodySizes, len(body))

	answers := map[string]typesafe.Answer{}
	for id, question := range req.Questions {
		if len(question.Criteria) > typesafe.MaxChoiceOptions {
			f.t.Errorf("question %q has %d options", id, len(question.Criteria))
		}
		if !strings.Contains(question.Instructions, "`text`") {
			f.t.Errorf("question %q does not reference `text`", id)
		}
		answers[id] = defaultAnswer(question.Type, question.Criteria)
	}
	for id, answer := range f.checked {
		question, asked := req.Questions[id]
		if !asked {
			f.t.Errorf("the request has no question %q", id)
			continue
		}
		if _, ok := question.Criteria[answer.Choice]; answer.Type == typesafe.QuestionTypeChoice && !ok {
			f.t.Errorf("question %q has no option %q (options: %v)", id, answer.Choice, req.options(id))
		}
		answers[id] = answer
	}
	for id, answer := range f.unchecked {
		answers[id] = answer
	}

	_ = json.NewEncoder(w).Encode(typesafe.Response{Model: "jev-test", Answers: answers})
}

func defaultAnswer(questionType string, criteria map[string]any) typesafe.Answer {
	if questionType == string(typesafe.QuestionTypeNoul) {
		return noul(0.02)
	}
	for _, key := range []string{optionNone, optionNotMentioned, directionWithinRange} {
		if _, ok := criteria[key]; ok {
			return choice(key, 0.95)
		}
	}
	return typesafe.Answer{}
}

func noul(probability float64) typesafe.Answer {
	return typesafe.Answer{Type: typesafe.QuestionTypeNoul, Noul: &probability}
}

func choice(option string, confidence float64) typesafe.Answer {
	return typesafe.Answer{Type: typesafe.QuestionTypeChoice, Choice: option, Confidence: &confidence}
}

// choiceWithProbabilities is a choice answer that has no confidence field.
func choiceWithProbabilities(option string, probabilities map[string]float64) typesafe.Answer {
	return typesafe.Answer{Type: typesafe.QuestionTypeChoice, Choice: option, Probabilities: probabilities}
}

func newTestTranslator(t *testing.T, fake *fakeTypeSafe) *Translator {
	t.Helper()

	fake.t = t
	srv := httptest.NewServer(fake)
	t.Cleanup(srv.Close)

	return &Translator{
		Evaluator: typesafe.NewClient(typesafe.Options{
			APIKey:      "test-key",
			BaseURL:     srv.URL,
			HTTPClient:  srv.Client(),
			BaseBackoff: time.Millisecond,
		}),
	}
}

func testInput(text string) Input {
	return Input{
		Text:                  text,
		Now:                   testNow,
		TimezoneOffsetMinutes: newYorkOffset,
		SearchAttributes:      testSearchAttributes,
		CustomAttributeNames:  []string{"CustomerTier", "IsVip", "Attempts"},
		KnownWorkflowTypes:    []string{"OrderWorkflow", "RefundWorkflow"},
	}
}

func keyword(attribute, conditional, value string, confidence float64) Filter {
	return Filter{Attribute: attribute, Type: TypeKeyword, Conditional: conditional, Value: value, Confidence: confidence}
}

func datetime(attribute, conditional, value string, confidence float64) Filter {
	return Filter{Attribute: attribute, Type: TypeDatetime, Conditional: conditional, Value: value, Confidence: confidence}
}

func TestTranslate(t *testing.T) {
	tests := []struct {
		name        string
		text        string
		mutate      func(*Input)
		answers     map[string]typesafe.Answer
		unchecked   map[string]typesafe.Answer
		wantOptions map[string][]string
		// wantExactOptions lists all the options of a question.
		wantExactOptions map[string][]string
		wantNotAsked     []string
		wantFilters      []Filter
		wantConfidence   float64
	}{
		{
			name: "status, known workflow type, and a local calendar day",
			text: "failed order workflows from yesterday",
			answers: map[string]typesafe.Answer{
				"status_Failed": noul(0.97),
				"workflow_type": choice("OrderWorkflow", 0.91),
				"time_range":    choice(rangeYesterday, 0.88),
			},
			wantOptions: map[string][]string{
				"workflow_type": {"OrderWorkflow", "RefundWorkflow", optionNone},
				"time_range":    {rangeYesterday, rangeCustomRelative, optionNone},
			},
			wantNotAsked: []string{"time_amount", "workflow_id", "id_is_prefix", "run_id"},
			wantFilters: []Filter{
				keyword("ExecutionStatus", "=", "Failed", 0.97),
				keyword("WorkflowType", "=", "OrderWorkflow", 0.91),
				datetime("StartTime", ">=", "2026-09-19T04:00:00Z", 0.88),
				datetime("StartTime", "<", "2026-09-20T04:00:00Z", 0.88),
			},
			wantConfidence: 0.88,
		},
		{
			name: "two statuses and a rolling preset",
			text: "running or timed out in the last 3 hours",
			answers: map[string]typesafe.Answer{
				"status_Running":  noul(0.9),
				"status_TimedOut": noul(0.85),
				"time_range":      choice(rangeLast3Hours, 0.93),
				// The speculative amount answer does not apply to a preset.
				"time_amount": choice("3", 0.51),
			},
			wantOptions: map[string][]string{"time_amount": {"3", optionNone}},
			wantFilters: []Filter{
				keyword("ExecutionStatus", "=", "Running", 0.9),
				keyword("ExecutionStatus", "=", "TimedOut", 0.85),
				datetime("StartTime", ">=", "2026-09-20T12:04:05Z", 0.93),
			},
			wantConfidence: 0.85,
		},
		{
			name: "older than a custom relative span",
			text: "older than 2 weeks",
			answers: map[string]typesafe.Answer{
				"time_range":     choice(rangeCustomRelative, 0.9),
				"time_amount":    choice("2", 0.92),
				"time_unit":      choice(unitWeeks, 0.97),
				"time_direction": choice(directionOlderThan, 0.8),
			},
			wantOptions: map[string][]string{"time_amount": {"2", optionNone}},
			wantFilters: []Filter{
				datetime("StartTime", "<", "2026-09-06T15:04:05Z", 0.8),
			},
			wantConfidence: 0.8,
		},
		{
			name: "number word, close time, and the weakest judgment",
			text: "closed more than three days ago",
			answers: map[string]typesafe.Answer{
				"time_attribute": choice(AttributeCloseTime, 0.7),
				"time_range":     choice(rangeCustomRelative, 0.9),
				"time_amount":    choice("3", 0.92),
				"time_unit":      choice(unitDays, 0.97),
				"time_direction": choice(directionOlderThan, 0.8),
			},
			wantOptions: map[string][]string{"time_amount": {"3", optionNone}},
			wantFilters: []Filter{
				datetime("CloseTime", "<", "2026-09-17T15:04:05Z", 0.7),
			},
			wantConfidence: 0.7,
		},
		{
			name: "custom relative span without an amount gives no filter",
			text: "in the last 2 hours",
			answers: map[string]typesafe.Answer{
				"time_range": choice(rangeCustomRelative, 0.9),
				"time_unit":  choice(unitHours, 0.97),
			},
			wantFilters: []Filter{},
		},
		{
			name: "workflow id prefix",
			text: "workflow id starts with order-123",
			answers: map[string]typesafe.Answer{
				"workflow_id":  choice("order-123", 0.9),
				"id_is_prefix": noul(0.95),
			},
			wantOptions: map[string][]string{
				"workflow_id":   {"order-123", optionNone},
				"workflow_type": {"order-123", "OrderWorkflow", optionNone},
			},
			wantNotAsked: []string{"time_amount", "run_id"},
			wantFilters: []Filter{
				keyword("WorkflowId", "STARTS_WITH", "order-123", 0.9),
			},
			wantConfidence: 0.9,
		},
		{
			name: "exact workflow id in quotes",
			text: `workflow id "12345"`,
			answers: map[string]typesafe.Answer{
				"workflow_id": choice("12345", 0.9),
			},
			wantNotAsked: []string{"time_amount"},
			wantFilters: []Filter{
				keyword("WorkflowId", "=", "12345", 0.9),
			},
			wantConfidence: 0.9,
		},
		{
			name: "uncertain prefix judgment lowers the confidence",
			text: "id order-123",
			answers: map[string]typesafe.Answer{
				"workflow_id":  choice("order-123", 0.9),
				"id_is_prefix": noul(0.5),
			},
			wantFilters: []Filter{
				keyword("WorkflowId", "=", "order-123", 0.5),
			},
			wantConfidence: 0.5,
		},
		{
			name: "run id candidates are UUIDs only",
			text: "run 3f2b8c1e-9a4d-4e7b-8c21-0a1b2c3d4e5f of payment_flow",
			answers: map[string]typesafe.Answer{
				"run_id":        choice("3f2b8c1e-9a4d-4e7b-8c21-0a1b2c3d4e5f", 0.96),
				"workflow_type": choice("payment_flow", 0.75),
			},
			wantOptions: map[string][]string{
				"run_id": {"3f2b8c1e-9a4d-4e7b-8c21-0a1b2c3d4e5f", optionNone},
			},
			wantFilters: []Filter{
				keyword("WorkflowType", "=", "payment_flow", 0.75),
				keyword("RunId", "=", "3f2b8c1e-9a4d-4e7b-8c21-0a1b2c3d4e5f", 0.96),
			},
			wantConfidence: 0.75,
		},
		{
			name: "one span has one role: the strongest judgment stays",
			text: "find order-123",
			answers: map[string]typesafe.Answer{
				"workflow_type": choice("order-123", 0.6),
				"workflow_id":   choice("order-123", 0.9),
			},
			wantFilters: []Filter{
				keyword("WorkflowId", "=", "order-123", 0.9),
			},
			wantConfidence: 0.9,
		},
		{
			name:         "text that is not a search is not understood",
			text:         "hello there, how are you",
			mutate:       func(in *Input) { in.KnownWorkflowTypes = nil },
			wantNotAsked: []string{"workflow_type", "workflow_id", "run_id", "id_is_prefix", "time_amount"},
			wantFilters:  []Filter{},
		},
		{
			name: "an option that code did not send gives no filter",
			text: "payment workflows",
			unchecked: map[string]typesafe.Answer{
				"workflow_type": choice("PaymentWorkflow", 0.99),
				"time_range":    choice("last_year", 0.99),
			},
			wantFilters: []Filter{},
		},
		{
			name: "judgments below the thresholds give no filter",
			text: "maybe failed order-123 today",
			answers: map[string]typesafe.Answer{
				"status_Failed": noul(0.59),
				"workflow_id":   choice("order-123", 0.49),
				"time_range":    choice(rangeToday, 0.49),
			},
			wantFilters: []Filter{},
		},
		{
			name: "low confidence in the time direction gives no time filter",
			text: "failed around yesterday",
			answers: map[string]typesafe.Answer{
				"status_Failed":  noul(0.8),
				"time_range":     choice(rangeYesterday, 0.9),
				"time_direction": choice(directionOlderThan, 0.4),
			},
			wantFilters: []Filter{
				keyword("ExecutionStatus", "=", "Failed", 0.8),
			},
			wantConfidence: 0.8,
		},
		{
			name: "low confidence in the time attribute selects the default attribute",
			text: "today",
			answers: map[string]typesafe.Answer{
				"time_attribute": choice(AttributeCloseTime, 0.3),
				"time_range":     choice(rangeToday, 0.9),
			},
			wantFilters: []Filter{
				datetime("StartTime", ">=", "2026-09-20T04:00:00Z", 0.9),
			},
			wantConfidence: 0.9,
		},
		{
			name: "bool and keyword custom attributes",
			text: "vip customers in the gold tier",
			answers: map[string]typesafe.Answer{
				"custom_0": choice("gold", 0.8),
				"custom_1": choice(optionTrue, 0.9),
			},
			wantOptions: map[string][]string{
				"custom_0": {"gold", "vip", "tier", optionNotMentioned},
				"custom_1": {optionTrue, optionFalse, optionNotMentioned},
			},
			// Attempts is an Int attribute: no question in this version.
			wantNotAsked: []string{"custom_2"},
			wantFilters: []Filter{
				keyword("CustomerTier", "=", "gold", 0.8),
				{Attribute: "IsVip", Type: TypeBool, Conditional: "=", Value: "true", Confidence: 0.9},
			},
			wantConfidence: 0.8,
		},
		{
			name: "an answer without confidence uses the probability of its option",
			text: "order workflows from yesterday",
			unchecked: map[string]typesafe.Answer{
				"workflow_type": choiceWithProbabilities("OrderWorkflow", map[string]float64{"OrderWorkflow": 0.83, "RefundWorkflow": 0.1, optionNone: 0.07}),
				// The probability of the selected option is below the threshold.
				"time_range": choiceWithProbabilities(rangeYesterday, map[string]float64{rangeYesterday: 0.45, rangeToday: 0.4, optionNone: 0.15}),
			},
			wantFilters: []Filter{
				keyword("WorkflowType", "=", "OrderWorkflow", 0.83),
			},
			wantConfidence: 0.83,
		},
		{
			name: "an answer without confidence and without probabilities gives no filter",
			text: "order workflows from yesterday",
			unchecked: map[string]typesafe.Answer{
				"workflow_type": {Type: typesafe.QuestionTypeChoice, Choice: "OrderWorkflow"},
				"time_range":    {Type: typesafe.QuestionTypeChoice, Choice: rangeYesterday, Probabilities: map[string]float64{rangeToday: 0.9}},
			},
			wantFilters: []Filter{},
		},
		{
			name: "status and time words are not keyword candidates",
			text: "failed order workflows from yesterday in the last 3 hours",
			answers: map[string]typesafe.Answer{
				"status_Failed": noul(0.97),
			},
			// A model that selects "failed" selects an option that code did not send.
			unchecked: map[string]typesafe.Answer{
				"custom_0": choice("failed", 0.99),
			},
			wantExactOptions: map[string][]string{
				"custom_0": {"order", optionNotMentioned},
			},
			wantFilters: []Filter{
				keyword("ExecutionStatus", "=", "Failed", 0.97),
			},
			wantConfidence: 0.97,
		},
		{
			name: "one word has one role across the status and custom questions, without regard to case",
			text: `show the "failed" tier for order-123`,
			answers: map[string]typesafe.Answer{
				"status_Failed": noul(0.9),
				"custom_0":      choice("failed", 0.7),
				"workflow_type": choice("order-123", 0.6),
				"workflow_id":   choice("order-123", 0.8),
			},
			wantFilters: []Filter{
				keyword("ExecutionStatus", "=", "Failed", 0.9),
				keyword("WorkflowId", "=", "order-123", 0.8),
			},
			wantConfidence: 0.8,
		},
		{
			name: "the custom answer stays when it is stronger than the status answer",
			text: `tier "failed"`,
			answers: map[string]typesafe.Answer{
				"status_Failed": noul(0.65),
				"custom_0":      choice("failed", 0.95),
			},
			wantFilters: []Filter{
				keyword("CustomerTier", "=", "failed", 0.95),
			},
			wantConfidence: 0.95,
		},
		{
			name: "two bool attributes with the same value are not in conflict",
			text: "vip and active customers",
			mutate: func(in *Input) {
				in.SearchAttributes = map[string]string{"IsVip": "Bool", "IsActive": "Bool"}
				in.CustomAttributeNames = []string{"IsVip", "IsActive"}
			},
			answers: map[string]typesafe.Answer{
				"custom_0": choice(optionTrue, 0.9),
				"custom_1": choice(optionTrue, 0.8),
			},
			wantFilters: []Filter{
				{Attribute: "IsVip", Type: TypeBool, Conditional: "=", Value: "true", Confidence: 0.9},
				{Attribute: "IsActive", Type: TypeBool, Conditional: "=", Value: "true", Confidence: 0.8},
			},
			wantConfidence: 0.8,
		},
		{
			name: "keyword options of one custom attribute have a cap",
			text: "w01 w02 w03 w04 w05 w06 w07 w08 w09 w10 w11 w12 w13 w14 w15 w16 w17 w18 w19 w20 w21 w22 w23 w24 w25 w26 w27 w28 w29 w30",
			wantExactOptions: map[string][]string{
				"custom_0": {
					"w01", "w02", "w03", "w04", "w05", "w06", "w07", "w08", "w09", "w10", "w11", "w12", "w13",
					"w14", "w15", "w16", "w17", "w18", "w19", "w20", "w21", "w22", "w23", "w24", "w25",
					optionNotMentioned,
				},
			},
			wantFilters: []Filter{},
		},
		{
			name: "an attribute with an unknown type gets no question",
			text: "workflow id order-123 of vip customers",
			mutate: func(in *Input) {
				in.SearchAttributes = map[string]string{"WorkflowId": "Mystery", "WorkflowType": "", "IsVip": "bool"}
				in.CustomAttributeNames = []string{"IsVip"}
			},
			wantNotAsked: []string{"workflow_id", "id_is_prefix", "workflow_type", "custom_0"},
			wantFilters:  []Filter{},
		},
		{
			name: "attributes that the namespace does not have get no question",
			text: "workflow id order-123 of type OrderWorkflow for vip customers",
			mutate: func(in *Input) {
				in.SearchAttributes = map[string]string{}
			},
			answers: map[string]typesafe.Answer{
				"status_Completed": noul(0.9),
			},
			wantNotAsked: []string{"workflow_type", "workflow_id", "id_is_prefix", "run_id", "custom_0", "custom_1"},
			wantFilters: []Filter{
				keyword("ExecutionStatus", "=", "Completed", 0.9),
			},
			wantConfidence: 0.9,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fake := &fakeTypeSafe{checked: tt.answers, unchecked: tt.unchecked}
			translator := newTestTranslator(t, fake)

			in := testInput(tt.text)
			if tt.mutate != nil {
				tt.mutate(&in)
			}

			result, err := translator.Translate(context.Background(), in)
			require.NoError(t, err)

			// All the questions go out in one request.
			require.Len(t, fake.requests, 1)
			sent := fake.requests[0]
			assert.Equal(t, DefaultModel, sent.Model)
			assert.Equal(t, tt.text, sent.State["text"])
			for _, status := range executionStatuses {
				assert.Contains(t, sent.Questions, "status_"+status.value)
			}
			for id, options := range tt.wantOptions {
				require.Contains(t, sent.Questions, id)
				assert.Subset(t, sent.options(id), options, "options of %s", id)
			}
			for id, options := range tt.wantExactOptions {
				require.Contains(t, sent.Questions, id)
				assert.ElementsMatch(t, options, sent.options(id), "options of %s", id)
			}
			for _, id := range tt.wantNotAsked {
				assert.NotContains(t, sent.Questions, id)
			}

			assert.Equal(t, tt.wantFilters, result.Filters)
			assert.InDelta(t, tt.wantConfidence, result.Confidence, 1e-9)
			assert.Equal(t, len(tt.wantFilters) > 0, result.Understood)
		})
	}
}

func TestTranslateState(t *testing.T) {
	fake := &fakeTypeSafe{}
	translator := newTestTranslator(t, fake)
	translator.Model = "jev-1.13"

	in := testInput("anything")
	// 20:00 UTC on Sunday is 01:30 on Monday in a UTC+5:30 zone.
	in.Now = time.Date(2026, time.September, 20, 20, 0, 0, 0, time.UTC)
	in.TimezoneOffsetMinutes = 330

	_, err := translator.Translate(context.Background(), in)
	require.NoError(t, err)
	require.Len(t, fake.requests, 1)

	sent := fake.requests[0]
	assert.Equal(t, "jev-1.13", sent.Model)
	assert.Equal(t, map[string]any{"date": "2026-09-21", "weekday": "Monday"}, sent.State["today"])
	assert.Equal(t, []any{"OrderWorkflow", "RefundWorkflow"}, sent.State["knownWorkflowTypes"])
	assert.Equal(t, []any{
		map[string]any{"name": "CustomerTier", "type": "Keyword"},
		map[string]any{"name": "IsVip", "type": "Bool"},
	}, sent.State["customAttributes"])
}

func TestTranslateCapsCustomAttributes(t *testing.T) {
	fake := &fakeTypeSafe{}
	translator := newTestTranslator(t, fake)

	in := testInput("anything")
	in.SearchAttributes = map[string]string{}
	in.CustomAttributeNames = nil
	for i := 0; i < MaxCustomAttributes+10; i++ {
		name := fmt.Sprintf("Flag%d", i)
		in.SearchAttributes[name] = TypeBool
		in.CustomAttributeNames = append(in.CustomAttributeNames, name)
	}

	_, err := translator.Translate(context.Background(), in)
	require.NoError(t, err)
	require.Len(t, fake.requests, 1)

	var custom int
	for id := range fake.requests[0].Questions {
		if strings.HasPrefix(id, questionCustomPrefix) {
			custom++
		}
	}
	assert.Equal(t, MaxCustomAttributes, custom)
}

func TestTranslateValidation(t *testing.T) {
	long := strings.Repeat("x", MaxNameLength+1)
	many := func(n int) []string {
		out := make([]string, n)
		for i := range out {
			out[i] = fmt.Sprintf("Name%d", i)
		}
		return out
	}

	tests := []struct {
		name      string
		mutate    func(*Input)
		wantField string
	}{
		{"empty text", func(in *Input) { in.Text = "  " }, "text"},
		{"text too long", func(in *Input) { in.Text = strings.Repeat("a", MaxTextLength+1) }, "text"},
		{"missing now", func(in *Input) { in.Now = time.Time{} }, "now"},
		{"offset too large", func(in *Input) { in.TimezoneOffsetMinutes = 15 * 60 }, "timezoneOffsetMinutes"},
		{"offset too small", func(in *Input) { in.TimezoneOffsetMinutes = -15 * 60 }, "timezoneOffsetMinutes"},
		{"too many search attributes", func(in *Input) {
			in.SearchAttributes = map[string]string{}
			for _, name := range many(MaxSearchAttributes + 1) {
				in.SearchAttributes[name] = TypeKeyword
			}
		}, "searchAttributes"},
		{"search attribute name too long", func(in *Input) { in.SearchAttributes = map[string]string{long: TypeKeyword} }, "searchAttributes"},
		{"search attribute type too long", func(in *Input) { in.SearchAttributes = map[string]string{"A": long} }, "searchAttributes"},
		{"too many custom attribute names", func(in *Input) { in.CustomAttributeNames = many(MaxSearchAttributes + 1) }, "customAttributeNames"},
		{"custom attribute name too long", func(in *Input) { in.CustomAttributeNames = []string{long} }, "customAttributeNames"},
		{"too many known workflow types", func(in *Input) { in.KnownWorkflowTypes = many(MaxKnownWorkflowTypes + 1) }, "knownWorkflowTypes"},
		{"known workflow type too long", func(in *Input) { in.KnownWorkflowTypes = []string{long} }, "knownWorkflowTypes"},
		{"empty known workflow type", func(in *Input) { in.KnownWorkflowTypes = []string{""} }, "knownWorkflowTypes"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fake := &fakeTypeSafe{}
			translator := newTestTranslator(t, fake)

			in := testInput("failed workflows")
			tt.mutate(&in)

			_, err := translator.Translate(context.Background(), in)
			var validationErr *ValidationError
			require.ErrorAs(t, err, &validationErr)
			assert.Equal(t, tt.wantField, validationErr.Field)
			assert.Empty(t, fake.requests, "invalid input must not reach TypeSafe")
		})
	}

	t.Run("input at the limits is valid", func(t *testing.T) {
		fake := &fakeTypeSafe{}
		translator := newTestTranslator(t, fake)

		in := testInput(strings.Repeat("é", MaxTextLength))
		in.KnownWorkflowTypes = many(MaxKnownWorkflowTypes)
		in.TimezoneOffsetMinutes = MaxTimezoneOffsetMinutes

		_, err := translator.Translate(context.Background(), in)
		require.NoError(t, err)
	})
}

func TestTranslateEvaluatorError(t *testing.T) {
	fake := &fakeTypeSafe{status: http.StatusUnauthorized}
	translator := newTestTranslator(t, fake)

	_, err := translator.Translate(context.Background(), testInput("failed workflows"))
	require.Error(t, err)
	assert.ErrorIs(t, err, typesafe.ErrUnauthorized)

	var validationErr *ValidationError
	assert.False(t, errors.As(err, &validationErr))
}

func TestCalendarMath(t *testing.T) {
	const kolkataOffset = 330
	// 20:00 UTC on Sunday 2026-09-20 is 01:30 on Monday 2026-09-21 in a UTC+5:30 zone.
	lateSunday := time.Date(2026, time.September, 20, 20, 0, 0, 0, time.UTC)

	tests := []struct {
		name      string
		now       time.Time
		offset    int
		preset    string
		amount    int
		unit      string
		wantStart string
		wantEnd   string
	}{
		{name: "today west of UTC", now: testNow, offset: newYorkOffset, preset: rangeToday, wantStart: "2026-09-20T04:00:00Z"},
		{name: "today east of UTC is the next local day", now: lateSunday, offset: kolkataOffset, preset: rangeToday, wantStart: "2026-09-20T18:30:00Z"},
		{name: "today in UTC", now: testNow, offset: 0, preset: rangeToday, wantStart: "2026-09-20T00:00:00Z"},
		{name: "yesterday west of UTC", now: testNow, offset: newYorkOffset, preset: rangeYesterday, wantStart: "2026-09-19T04:00:00Z", wantEnd: "2026-09-20T04:00:00Z"},
		{name: "yesterday east of UTC", now: lateSunday, offset: kolkataOffset, preset: rangeYesterday, wantStart: "2026-09-19T18:30:00Z", wantEnd: "2026-09-20T18:30:00Z"},
		{name: "this week on a local Sunday starts six days back", now: testNow, offset: newYorkOffset, preset: rangeThisWeek, wantStart: "2026-09-14T04:00:00Z"},
		{name: "this week on a local Monday starts that day", now: lateSunday, offset: kolkataOffset, preset: rangeThisWeek, wantStart: "2026-09-20T18:30:00Z"},
		{name: "last 15 minutes", now: testNow, offset: newYorkOffset, preset: rangeLast15Minutes, wantStart: "2026-09-20T14:49:05Z"},
		{name: "last hour", now: testNow, offset: newYorkOffset, preset: rangeLastHour, wantStart: "2026-09-20T14:04:05Z"},
		{name: "last 24 hours", now: testNow, offset: newYorkOffset, preset: rangeLast24Hours, wantStart: "2026-09-19T15:04:05Z"},
		{name: "last 7 days", now: testNow, offset: newYorkOffset, preset: rangeLast7Days, wantStart: "2026-09-13T15:04:05Z"},
		{name: "last 30 days", now: testNow, offset: newYorkOffset, preset: rangeLast30Days, wantStart: "2026-08-21T15:04:05Z"},
		{name: "last 90 days", now: testNow, offset: newYorkOffset, preset: rangeLast90Days, wantStart: "2026-06-22T15:04:05Z"},
		{name: "45 minutes", now: testNow, offset: newYorkOffset, amount: 45, unit: unitMinutes, wantStart: "2026-09-20T14:19:05Z"},
		{name: "6 hours", now: testNow, offset: newYorkOffset, amount: 6, unit: unitHours, wantStart: "2026-09-20T09:04:05Z"},
		{name: "2 weeks", now: testNow, offset: newYorkOffset, amount: 2, unit: unitWeeks, wantStart: "2026-09-06T15:04:05Z"},
		{name: "1 month", now: testNow, offset: newYorkOffset, amount: 1, unit: unitMonths, wantStart: "2026-08-20T15:04:05Z"},
		{name: "9999 months stays a valid timestamp", now: testNow, offset: newYorkOffset, amount: 9999, unit: unitMonths, wantStart: "1193-06-20T15:04:05Z"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			local := localNow(tt.now, tt.offset)

			var span timeRange
			var ok bool
			if tt.preset != "" {
				span, ok = presetRange(tt.preset, local)
			} else {
				span, ok = relativeRange(tt.amount, tt.unit, local)
			}
			require.True(t, ok)

			filters := span.filters(AttributeStartTime, directionWithinRange, 1)
			assert.Equal(t, ">=", filters[0].Conditional)
			assert.Equal(t, tt.wantStart, filters[0].Value)
			if tt.wantEnd == "" {
				assert.Len(t, filters, 1)
			} else {
				require.Len(t, filters, 2)
				assert.Equal(t, "<", filters[1].Conditional)
				assert.Equal(t, tt.wantEnd, filters[1].Value)
			}

			older := span.filters(AttributeCloseTime, directionOlderThan, 1)
			require.Len(t, older, 1)
			assert.Equal(t, datetime("CloseTime", "<", tt.wantStart, 1), older[0])
		})
	}

	t.Run("unknown preset, unknown unit, and zero amount give no range", func(t *testing.T) {
		local := localNow(testNow, 0)
		_, ok := presetRange("last_year", local)
		assert.False(t, ok)
		_, ok = relativeRange(3, "years", local)
		assert.False(t, ok)
		_, ok = relativeRange(0, unitDays, local)
		assert.False(t, ok)
	})
}

func TestCandidates(t *testing.T) {
	t.Run("identifier candidates", func(t *testing.T) {
		text := `show "my order" OrderWorkflow, order_flow and order-123 or v2 from the last 3 days. Also parseHTML, NASA, Failed`
		assert.Equal(t,
			[]string{"my order", "OrderWorkflow", "order_flow", "order-123", "v2", "parseHTML"},
			identifierCandidates(text),
		)
	})

	t.Run("values with a double quote, a backtick, or a backslash are not candidates", func(t *testing.T) {
		assert.Equal(t,
			[]string{"order-9"},
			identifierCandidates("find `ab\"c1` and x1\"y2 and z3`w4 and a1\\b2 and 'c3\\' and order-9"),
		)
		assert.Equal(t, []string{"gold"}, keywordCandidates("gold pla`tinum sil\"ver bro\\nze"))
	})

	t.Run("amount candidates", func(t *testing.T) {
		keys, values := amountCandidates("three or 12 or 45 or 3, not order-7, 0, 1.5, or 12345")
		assert.Equal(t, []string{"3", "12", "45"}, keys)
		assert.Equal(t, map[string]int{"3": 3, "12": 12, "45": 45}, values)
	})

	t.Run("keyword candidates skip stop words, status words, time words, and amounts", func(t *testing.T) {
		assert.Equal(t,
			[]string{"gold", "tier"},
			keywordCandidates("Failed or RUNNING workflows in the gold tier from yesterday, today, or the last 3 days, two weeks ago"),
		)
	})

	t.Run("options obey the limit and the reserved keys", func(t *testing.T) {
		var candidates []string
		for i := 0; i < 300; i++ {
			candidates = append(candidates, fmt.Sprintf("candidate-%d", i))
		}

		options := typesafe.ChoiceCriteria{}
		addOptions(options, []string{optionNone, optionNotMentioned, ""}, "reserved", maxCandidates)
		assert.Empty(t, options)

		addOptions(options, candidates, "candidate", maxCandidates)
		assert.Len(t, options, typesafe.MaxChoiceOptions-1)
	})
}

func manyWorkflowTypes(n int) []string {
	out := make([]string, n)
	for i := range out {
		out[i] = fmt.Sprintf("GeneratedWorkflowType%03d", i)
	}
	return out
}

// Input validation allows 100 known workflow types, so only the plan can see 300.
// The plan must obey the option limit without help from the validation.
func TestWorkflowTypeQuestionHasExactlyTheMaximumOptions(t *testing.T) {
	in := testInput("find order-123 and order_flow and OrderFlowV2")
	in.KnownWorkflowTypes = manyWorkflowTypes(300)

	question, asked := newPlan(in).questions[questionWorkflowType]
	require.True(t, asked)

	options := question.Criteria.(typesafe.ChoiceCriteria)
	assert.Len(t, options, typesafe.MaxChoiceOptions)
	assert.Contains(t, options, optionNone)
	assert.Contains(t, options, "GeneratedWorkflowType000")
	assert.Contains(t, options, "GeneratedWorkflowType253")
	assert.NotContains(t, options, "GeneratedWorkflowType254")
}

func TestWorkflowTypeQuestionAtTheValidationLimit(t *testing.T) {
	fake := &fakeTypeSafe{}
	translator := newTestTranslator(t, fake)

	in := testInput("find order-123 and order_flow")
	in.KnownWorkflowTypes = manyWorkflowTypes(MaxKnownWorkflowTypes)

	_, err := translator.Translate(context.Background(), in)
	require.NoError(t, err)
	require.Len(t, fake.requests, 1)

	want := append(manyWorkflowTypes(MaxKnownWorkflowTypes), "order-123", "order_flow", optionNone)
	assert.ElementsMatch(t, want, fake.requests[0].options(questionWorkflowType))
}

// The worst case for the request size: the maximum number of Keyword attributes,
// and a text of the maximum length that is all distinct candidates.
func TestRequestSizeHasABound(t *testing.T) {
	const maxRequestBytes = 48 << 10

	var words []string
	for i := 0; len(strings.Join(words, " ")) < MaxTextLength-4; i++ {
		words = append(words, fmt.Sprintf("k%02d", i))
	}
	text := strings.Join(words, " ")
	require.LessOrEqual(t, len(text), MaxTextLength)
	require.Greater(t, len(words), 100)

	fake := &fakeTypeSafe{}
	translator := newTestTranslator(t, fake)

	in := testInput(text)
	in.KnownWorkflowTypes = manyWorkflowTypes(MaxKnownWorkflowTypes)
	in.SearchAttributes = map[string]string{"WorkflowType": "Keyword", "WorkflowId": "Keyword", "RunId": "Keyword"}
	in.CustomAttributeNames = nil
	for i := 0; i < MaxCustomAttributes+5; i++ {
		name := fmt.Sprintf("CustomKeywordAttribute%02d", i)
		in.SearchAttributes[name] = TypeKeyword
		in.CustomAttributeNames = append(in.CustomAttributeNames, name)
	}

	_, err := translator.Translate(context.Background(), in)
	require.NoError(t, err)
	require.Len(t, fake.requests, 1)

	sent := fake.requests[0]
	for i := 0; i < MaxCustomAttributes; i++ {
		id := fmt.Sprintf("%s%d", questionCustomPrefix, i)
		require.Contains(t, sent.Questions, id)
		assert.Len(t, sent.options(id), MaxKeywordOptions+1, "options of %s", id)
	}
	assert.NotContains(t, sent.Questions, fmt.Sprintf("%s%d", questionCustomPrefix, MaxCustomAttributes))

	t.Logf("request size: %d bytes, %d questions", fake.bodySizes[0], len(sent.Questions))
	assert.Less(t, fake.bodySizes[0], maxRequestBytes)
}
