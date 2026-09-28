package nlsearch

import "github.com/temporalio/ui-server/v2/server/typesafe"

// Outcomes of one question in the trace.
const (
	// OutcomeKept means code used the answer.
	OutcomeKept = "kept"
	// OutcomeBelowThreshold means the answer was below the threshold of its question.
	OutcomeBelowThreshold = "below_threshold"
	// OutcomeNoMatch means the model selected the "no answer" option, or an option that code did not send.
	OutcomeNoMatch = "no_match"
	// OutcomeMissing means the response had no answer for the question.
	OutcomeMissing = "missing"
	// OutcomeUnused means code did not need the answer, for example the unit of a preset range.
	OutcomeUnused = "unused"
	// OutcomeIncomplete means the answer passed, but an answer that it depends on did not.
	OutcomeIncomplete = "incomplete"
	// OutcomeConflict means a stronger filter claimed the same word.
	OutcomeConflict = "conflict"
	// OutcomeUnavailable means the namespace does not have the attribute of the filter.
	OutcomeUnavailable = "unavailable"
)

// Question names in the trace.
const (
	TraceStatus        = "status"
	TraceWorkflowType  = "workflow_type"
	TraceTimeRange     = "time_range"
	TraceTimeAmount    = "time_amount"
	TraceTimeUnit      = "time_unit"
	TraceTimeDirection = "time_direction"
	TraceTimeAttribute = "time_attribute"
	TraceCustom        = "custom"
	// TraceValueAttribute asks which attribute a value of the text filters on. Its subject is the value.
	TraceValueAttribute = "value_attribute"
	// TraceValueComparison asks how a value of the text is compared. Its subject is the value.
	TraceValueComparison = "value_comparison"
)

// TraceStep records one question of a translation: what code asked, what the model
// answered, and what code did with the answer.
type TraceStep struct {
	ID string `json:"id"`
	// Question is one of the Trace question names.
	Question string `json:"question"`
	// Subject is the status value, the custom attribute name, or the value from the
	// text that the question is about.
	Subject string `json:"subject,omitempty"`
	// Kind is noul or choice.
	Kind string `json:"kind"`
	// Answer is the selected option of a choice question.
	Answer string `json:"answer,omitempty"`
	// Score is the noul probability or the choice confidence. It is nil when the response has none.
	Score *float64 `json:"score"`
	// Threshold is the minimum score that code used. It is nil when code did not read the answer.
	Threshold     *float64           `json:"threshold"`
	Probabilities map[string]float64 `json:"probabilities,omitempty"`
	Outcome       string             `json:"outcome"`
	// Filters are the filters that this answer produced.
	Filters []Filter `json:"filters,omitempty"`
}

type askedQuestion struct {
	id       string
	question string
	subject  string
}

// ask adds a question to the request and remembers its place in the trace.
func (p *plan) ask(id, question, subject string, q typesafe.Question) {
	if _, exists := p.questions[id]; !exists {
		p.asked = append(p.asked, askedQuestion{id: id, question: question, subject: subject})
	}
	p.questions[id] = q
}

// observe gives the trace step of a question, and creates it from the raw answer
// the first time. A new step is unused until a reader of the answer changes it.
func (p *plan) observe(answers map[string]typesafe.Answer, id string) *TraceStep {
	if step, ok := p.steps[id]; ok {
		return step
	}

	step := &TraceStep{ID: id, Kind: string(p.questions[id].Type), Outcome: OutcomeUnused}
	for _, asked := range p.asked {
		if asked.id == id {
			step.Question = asked.question
			step.Subject = asked.subject
			break
		}
	}

	answer, ok := answers[id]
	switch {
	case !ok:
		step.Outcome = OutcomeMissing
	case step.Kind == string(typesafe.QuestionTypeNoul):
		if answer.Noul == nil {
			step.Outcome = OutcomeMissing
		} else {
			score := *answer.Noul
			step.Score = &score
		}
	default:
		step.Answer = answer.Choice
		step.Probabilities = answer.Probabilities
		if confidence, ok := answer.ChoiceConfidence(); ok {
			step.Score = &confidence
		}
	}

	p.steps[id] = step
	return step
}

// attach connects filters to the question whose answer produced them.
func (p *plan) attach(answers map[string]typesafe.Answer, id string, filters ...Filter) {
	step := p.observe(answers, id)
	step.Filters = append(step.Filters, filters...)
}

// markDropped marks each kept step whose filters were all in before and none of
// them are in after.
func (p *plan) markDropped(before, after []Filter, outcome string) {
	inBefore := map[Filter]bool{}
	for _, filter := range before {
		inBefore[filter] = true
	}
	inAfter := map[Filter]bool{}
	for _, filter := range after {
		inAfter[filter] = true
	}

	for _, step := range p.steps {
		if step.Outcome != OutcomeKept || len(step.Filters) == 0 {
			continue
		}
		dropped := true
		for _, filter := range step.Filters {
			if !inBefore[filter] || inAfter[filter] {
				dropped = false
				break
			}
		}
		if dropped {
			step.Outcome = outcome
		}
	}
}

// trace gives one step for each question, in the order code asked them.
func (p *plan) trace(answers map[string]typesafe.Answer) []TraceStep {
	out := make([]TraceStep, 0, len(p.asked))
	for _, asked := range p.asked {
		out = append(out, *p.observe(answers, asked.id))
	}
	return out
}

func threshold(value float64) *float64 {
	return &value
}
