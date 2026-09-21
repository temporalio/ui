package nlsearch

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/temporalio/ui-server/v2/server/typesafe"
)

// Question ids. The model does not see them.
const (
	questionStatusPrefix  = "status_"
	questionTimeAttribute = "time_attribute"
	questionTimeRange     = "time_range"
	questionTimeAmount    = "time_amount"
	questionTimeUnit      = "time_unit"
	questionTimeDirection = "time_direction"
	questionWorkflowType  = "workflow_type"
	questionWorkflowID    = "workflow_id"
	questionRunID         = "run_id"
	questionIDIsPrefix    = "id_is_prefix"
	questionCustomPrefix  = "custom_"
)

// Option keys that mean "no answer". They are reserved: addOptions drops a candidate
// that is equal to one of them, so the user cannot search for those two literal values.
const (
	optionNone         = "none"
	optionNotMentioned = "not_mentioned"
)

// Option keys of a Bool attribute question. That question has no text candidates.
const (
	optionTrue  = "true"
	optionFalse = "false"
)

// Descriptions that all the candidates of one kind share. One string for each
// kind keeps the request small.
const (
	descriptionKnownType = "A known workflow type."
	descriptionTyped     = "Typed by the user."
	descriptionNumber    = "A number typed by the user."
)

// knownAttributeTypes is the set of search attribute types. A filter never gets a type outside it.
var knownAttributeTypes = map[string]bool{
	"Text": true, TypeKeyword: true, "Int": true, "Double": true,
	TypeBool: true, TypeDatetime: true, "KeywordList": true,
}

// executionStatuses lists each status value with the words that users give for it.
var executionStatuses = []struct{ value, meaning string }{
	{"Running", "still running: open, in progress, active, not finished yet"},
	{"Completed", "completed with success: succeeded, finished without an error"},
	{"Failed", "failed: ended with an error, errored, crashed, broken"},
	{"Canceled", "canceled (also written cancelled): stopped by a cancel request"},
	{"Terminated", "terminated: killed, stopped by force"},
	{"ContinuedAsNew", "continued as new: closed because it continued as a new run"},
	{"TimedOut", "timed out: closed because it hit a timeout"},
}

// Translator turns a natural-language request into filters.
type Translator struct {
	Evaluator Evaluator
	// Model is the System One model. An empty value selects DefaultModel.
	Model string
}

// Translate validates the input, asks all the questions in one request, and builds
// the filters from the answers that apply. An input outside the limits gives a
// *ValidationError. An Evaluator failure comes back wrapped.
func (t *Translator) Translate(ctx context.Context, in Input) (Result, error) {
	if t.Evaluator == nil {
		return Result{}, errors.New("nlsearch: no evaluator")
	}
	if err := in.Validate(); err != nil {
		return Result{}, err
	}

	model := t.Model
	if model == "" {
		model = DefaultModel
	}

	p := newPlan(in)
	res, err := t.Evaluator.Evaluate(ctx, typesafe.Request{
		Model:     model,
		State:     p.state(),
		Questions: p.questions,
	})
	if err != nil {
		return Result{}, fmt.Errorf("nlsearch: evaluation failed: %w", err)
	}

	return newResult(p.filters(res.Answers)), nil
}

func newResult(filters []Filter) Result {
	result := Result{Filters: filters, Understood: len(filters) > 0}
	if result.Filters == nil {
		result.Filters = []Filter{}
	}

	for i, filter := range filters {
		if i == 0 || filter.Confidence < result.Confidence {
			result.Confidence = filter.Confidence
		}
	}
	return result
}

// Validate checks the input against the limits. A violation gives a *ValidationError.
func (in Input) Validate() error {
	if strings.TrimSpace(in.Text) == "" {
		return invalid("text", "is required")
	}
	if utf8.RuneCountInString(in.Text) > MaxTextLength {
		return invalid("text", "must have %d characters or fewer", MaxTextLength)
	}
	if in.Now.IsZero() {
		return invalid("now", "is required")
	}
	if in.TimezoneOffsetMinutes < -MaxTimezoneOffsetMinutes || in.TimezoneOffsetMinutes > MaxTimezoneOffsetMinutes {
		return invalid("timezoneOffsetMinutes", "must be between %d and %d", -MaxTimezoneOffsetMinutes, MaxTimezoneOffsetMinutes)
	}

	if len(in.SearchAttributes) > MaxSearchAttributes {
		return invalid("searchAttributes", "must have %d entries or fewer", MaxSearchAttributes)
	}
	for name, attributeType := range in.SearchAttributes {
		if err := validateName("searchAttributes", name); err != nil {
			return err
		}
		if utf8.RuneCountInString(attributeType) > MaxNameLength {
			return invalid("searchAttributes", "has a type with more than %d characters", MaxNameLength)
		}
	}

	// Each custom attribute is also a search attribute, so the same count limit applies.
	if len(in.CustomAttributeNames) > MaxSearchAttributes {
		return invalid("customAttributeNames", "must have %d entries or fewer", MaxSearchAttributes)
	}
	for _, name := range in.CustomAttributeNames {
		if err := validateName("customAttributeNames", name); err != nil {
			return err
		}
	}

	if len(in.KnownWorkflowTypes) > MaxKnownWorkflowTypes {
		return invalid("knownWorkflowTypes", "must have %d entries or fewer", MaxKnownWorkflowTypes)
	}
	for _, name := range in.KnownWorkflowTypes {
		if err := validateName("knownWorkflowTypes", name); err != nil {
			return err
		}
	}

	return nil
}

func validateName(field, name string) error {
	if name == "" {
		return invalid(field, "has an empty name")
	}
	if utf8.RuneCountInString(name) > MaxNameLength {
		return invalid(field, "has a name with more than %d characters", MaxNameLength)
	}
	return nil
}

// customQuestion connects a question id to the custom attribute that it is about.
type customQuestion struct {
	id            string
	name          string
	attributeType string
}

// plan holds the questions of one request and the data that code needs to read the answers.
type plan struct {
	in        Input
	local     time.Time
	questions map[string]typesafe.Question
	amounts   map[string]int
	customs   []customQuestion
}

func newPlan(in Input) *plan {
	p := &plan{
		in:        in,
		local:     localNow(in.Now, in.TimezoneOffsetMinutes),
		questions: map[string]typesafe.Question{},
	}

	p.addStatusQuestions()
	p.addTimeQuestions()
	p.addIdentifierQuestions()
	p.addCustomQuestions()

	return p
}

// state is the content that every question reads.
func (p *plan) state() map[string]any {
	customAttributes := make([]map[string]string, 0, len(p.customs))
	for _, custom := range p.customs {
		customAttributes = append(customAttributes, map[string]string{"name": custom.name, "type": custom.attributeType})
	}

	knownWorkflowTypes := p.in.KnownWorkflowTypes
	if knownWorkflowTypes == nil {
		knownWorkflowTypes = []string{}
	}

	return map[string]any{
		"text": p.in.Text,
		"today": map[string]string{
			"date":    p.local.Format("2006-01-02"),
			"weekday": p.local.Weekday().String(),
		},
		"knownWorkflowTypes": knownWorkflowTypes,
		"customAttributes":   customAttributes,
	}
}

func (p *plan) addStatusQuestions() {
	for _, status := range executionStatuses {
		p.questions[questionStatusPrefix+status.value] = typesafe.NewNoul(
			fmt.Sprintf("`text` is a request to search workflow executions. Does the user want workflows with the execution status %s? That status means %s.", status.value, status.meaning),
			fmt.Sprintf("The request names the status %s, a synonym of it, or a group of statuses that includes it (for example, \"closed\" or \"not running\" includes each status other than Running).", status.value),
			fmt.Sprintf("The request does not mention the status %s, or it excludes that status.", status.value),
		)
	}
}

func (p *plan) addTimeQuestions() {
	p.questions[questionTimeAttribute] = typesafe.NewChoice(
		"`text` is a request to search workflow executions. If it has a time expression, which timestamp of the workflow does the time expression apply to?",
		typesafe.ChoiceCriteria{
			AttributeStartTime:     "The time the workflow started: \"started\", \"began\", \"launched\", \"created\", \"ran\".",
			AttributeCloseTime:     "The time the workflow closed: \"closed\", \"finished\", \"ended\", \"completed at\", \"failed at\".",
			AttributeExecutionTime: "The time the workflow was scheduled to execute, for a delayed or cron workflow: \"scheduled for\", \"execution time\".",
			optionNone:             "There is no time expression, or the request does not say which timestamp it applies to.",
		},
	)

	p.questions[questionTimeRange] = typesafe.NewChoice(
		"`text` is a request to search workflow executions. Which period of time does it name? `today` gives the current date of the user.",
		typesafe.ChoiceCriteria{
			rangeLast15Minutes:  "15 minutes, a quarter of an hour.",
			rangeLastHour:       "1 hour: \"the last hour\", \"past 60 minutes\".",
			rangeLast3Hours:     "3 hours.",
			rangeLast24Hours:    "24 hours: \"the last day\", \"past 24 hours\".",
			rangeToday:          "The current calendar day: \"today\", \"this morning\".",
			rangeYesterday:      "The previous calendar day: \"yesterday\", \"last night\".",
			rangeThisWeek:       "The current calendar week: \"this week\".",
			rangeLast7Days:      "7 days: \"the last week\", \"past 7 days\".",
			rangeLast30Days:     "30 days: \"the last month\", \"past 30 days\".",
			rangeLast90Days:     "90 days: \"the last quarter\", \"past 3 months\".",
			rangeCustomRelative: "A different span given as a number and a unit: \"last 45 minutes\", \"past 2 weeks\", \"older than 3 days\", \"more than 6 hours ago\".",
			optionNone:          "The request names no period of time, or it names a period that no other option covers.",
		},
	)

	p.questions[questionTimeUnit] = typesafe.NewChoice(
		"`text` is a request to search workflow executions. If it gives a span of time as a number and a unit, which unit is it?",
		typesafe.ChoiceCriteria{
			unitMinutes: "Minutes: \"min\", \"mins\", \"m\".",
			unitHours:   "Hours: \"hr\", \"hrs\", \"h\".",
			unitDays:    "Days: \"d\".",
			unitWeeks:   "Weeks: \"wk\", \"w\".",
			unitMonths:  "Months.",
			optionNone:  "The request gives no span of time with a unit.",
		},
	)

	p.questions[questionTimeDirection] = typesafe.NewChoice(
		"`text` is a request to search workflow executions. Does the user want workflows inside the named period of time, or workflows from before it?",
		typesafe.ChoiceCriteria{
			directionWithinRange: "Inside the period: \"in the last 3 hours\", \"from yesterday\", \"today\", \"since Monday\", \"newer than 2 days\". Also select this option when there is no period of time.",
			directionOlderThan:   "Before the period: \"older than 3 days\", \"more than 2 weeks ago\", \"before yesterday\", \"not in the last hour\".",
		},
	)

	amounts, values := amountCandidates(p.in.Text)
	p.amounts = values

	options := typesafe.ChoiceCriteria{}
	addOptions(options, amounts, descriptionNumber, maxCandidates)
	if len(options) == 0 {
		return
	}
	options[optionNone] = "No number in the request is an amount of time."
	p.questions[questionTimeAmount] = typesafe.NewChoice(
		"`text` is a request to search workflow executions. Which number is the amount of the span of time, such as the 3 in \"last 3 hours\" or in \"older than three days\"? Number words are given as digits. A number that is part of a name or an id is not an amount of time.",
		options,
	)
}

func (p *plan) addIdentifierQuestions() {
	identifiers := identifierCandidates(p.in.Text)

	if p.hasAttribute(AttributeWorkflowType) {
		options := typesafe.ChoiceCriteria{}
		addOptions(options, p.in.KnownWorkflowTypes, descriptionKnownType, maxCandidates)
		addOptions(options, identifiers, descriptionTyped, maxCandidates)
		if len(options) > 0 {
			options[optionNone] = "The request names no workflow type, or no option matches the named type. A value that the request gives as a workflow id or a run id is not a workflow type."
			p.questions[questionWorkflowType] = typesafe.NewChoice(
				"`text` is a request to search workflow executions. Which option is the workflow type that the user wants? A workflow type is the name of a workflow definition, such as OrderWorkflow. The user can write it loosely: \"order workflows\" means OrderWorkflow when that option exists.",
				options,
			)
		}
	}

	if p.hasAttribute(AttributeWorkflowID) {
		options := typesafe.ChoiceCriteria{}
		addOptions(options, identifiers, descriptionTyped, maxCandidates)
		if len(options) > 0 {
			options[optionNone] = "The request gives no workflow id. A workflow type name or a run id is not a workflow id."
			p.questions[questionWorkflowID] = typesafe.NewChoice(
				"`text` is a request to search workflow executions. Which option is the workflow id, or the start of the workflow id, that the user wants? A workflow id is the business identifier of one workflow, such as order-123. Users usually introduce it with \"workflow id\", \"id\", or \"wf id\".",
				options,
			)
			p.questions[questionIDIsPrefix] = typesafe.NewNoul(
				"`text` is a request to search workflow executions. Does the user want each workflow whose workflow id STARTS WITH a given value, and not one exact workflow id?",
				"The request asks for a prefix: \"id starts with\", \"ids beginning with\", \"prefixed with\", or a value that ends with a wildcard.",
				"The request gives one exact workflow id, or it gives no workflow id.",
			)
		}
	}

	if p.hasAttribute(AttributeRunID) {
		options := typesafe.ChoiceCriteria{}
		addOptions(options, uuidCandidates(p.in.Text), descriptionTyped, maxCandidates)
		if len(options) > 0 {
			options[optionNone] = "The request gives no run id. A UUID that the request gives as a workflow id is not a run id."
			p.questions[questionRunID] = typesafe.NewChoice(
				"`text` is a request to search workflow executions. Which option is the run id that the user wants? A run id is the UUID of one run of a workflow. Users usually introduce it with \"run id\" or \"run\".",
				options,
			)
		}
	}
}

func (p *plan) addCustomQuestions() {
	var keywords []string
	seen := map[string]bool{}

	for _, name := range p.in.CustomAttributeNames {
		if len(p.customs) == MaxCustomAttributes {
			return
		}
		if seen[name] {
			continue
		}
		seen[name] = true

		custom := customQuestion{
			id:            questionCustomPrefix + strconv.Itoa(len(p.customs)),
			name:          name,
			attributeType: p.in.SearchAttributes[name],
		}

		switch custom.attributeType {
		case TypeBool:
			p.questions[custom.id] = typesafe.NewChoice(
				fmt.Sprintf("`text` is a request to search workflow executions. Workflows have a custom true or false attribute with the name %q. Which value of %q does the user want?", name, name),
				typesafe.ChoiceCriteria{
					optionTrue:         fmt.Sprintf("The user wants workflows where %q is true.", name),
					optionFalse:        fmt.Sprintf("The user wants workflows where %q is false.", name),
					optionNotMentioned: fmt.Sprintf("The request puts no condition on %q.", name),
				},
			)
		case TypeKeyword:
			if keywords == nil {
				keywords = keywordCandidates(p.in.Text)
			}
			options := typesafe.ChoiceCriteria{}
			addOptions(options, keywords, descriptionTyped, MaxKeywordOptions)
			if len(options) == 0 {
				continue
			}
			options[optionNotMentioned] = fmt.Sprintf("The request puts no condition on %q, or no option is the value.", name)
			p.questions[custom.id] = typesafe.NewChoice(
				fmt.Sprintf("`text` is a request to search workflow executions. Workflows have a custom text attribute with the name %q. Which option is the value of %q that the user wants? Do not select the name of the attribute.", name, name),
				options,
			)
		default:
			// Other attribute types get no question in this version.
			continue
		}

		p.customs = append(p.customs, custom)
	}
}

// addOptions adds each candidate as an option whose key is the literal value. It keeps
// the first description of a value, skips the reserved keys, and stops when the
// question has limit options. The caller adds the "no answer" option after that.
func addOptions(options typesafe.ChoiceCriteria, candidates []string, description string, limit int) {
	for _, candidate := range candidates {
		if len(options) >= limit {
			return
		}
		if candidate == "" || candidate == optionNone || candidate == optionNotMentioned {
			continue
		}
		if _, exists := options[candidate]; !exists {
			options[candidate] = description
		}
	}
}

// hasAttribute reports whether a filter can use the attribute. The status and time
// attributes of the system are always available. Each other attribute must be in
// the search attributes of the request, with a type from the known set.
func (p *plan) hasAttribute(name string) bool {
	switch name {
	case AttributeExecutionStatus, AttributeStartTime, AttributeCloseTime, AttributeExecutionTime:
		return true
	}
	return knownAttributeTypes[p.in.SearchAttributes[name]]
}

// attributeType gives the type of the attribute from the request.
func (p *plan) attributeType(name string) string {
	return p.in.SearchAttributes[name]
}

// selected gives the option that a choice question selected and its confidence.
// It is false when code did not ask the question, the answer is absent, the option
// is not one of the options that code sent, the option means "no answer", or the
// confidence is below MinChoiceConfidence. An answer with no confidence and no
// probability for its option is below the threshold.
func (p *plan) selected(answers map[string]typesafe.Answer, id string) (string, float64, bool) {
	question, asked := p.questions[id]
	if !asked {
		return "", 0, false
	}
	options, isChoice := question.Criteria.(typesafe.ChoiceCriteria)
	if !isChoice {
		return "", 0, false
	}

	answer, ok := answers[id]
	if !ok {
		return "", 0, false
	}
	if _, sent := options[answer.Choice]; !sent {
		return "", 0, false
	}
	if answer.Choice == optionNone || answer.Choice == optionNotMentioned {
		return "", 0, false
	}
	confidence, ok := answer.ChoiceConfidence()
	if !ok || confidence < MinChoiceConfidence {
		return "", 0, false
	}

	return answer.Choice, confidence, true
}

// noul gives the probability of true for a noul question.
func (p *plan) noul(answers map[string]typesafe.Answer, id string) (float64, bool) {
	if _, asked := p.questions[id]; !asked {
		return 0, false
	}
	answer, ok := answers[id]
	if !ok || answer.Noul == nil {
		return 0, false
	}
	return *answer.Noul, true
}

// filters builds the filters from the answers that apply, then removes each filter
// whose attribute the request does not have.
func (p *plan) filters(answers map[string]typesafe.Answer) []Filter {
	var all []Filter
	all = append(all, p.statusFilters(answers)...)
	all = append(all, p.identifierFilters(answers)...)
	all = append(all, p.customFilters(answers)...)
	all = keepStrongestPerValue(all)
	all = append(all, p.timeFilters(answers)...)

	out := make([]Filter, 0, len(all))
	for _, filter := range all {
		if p.hasAttribute(filter.Attribute) {
			out = append(out, filter)
		}
	}
	return out
}

func (p *plan) statusFilters(answers map[string]typesafe.Answer) []Filter {
	var out []Filter
	for _, status := range executionStatuses {
		probability, ok := p.noul(answers, questionStatusPrefix+status.value)
		if !ok || probability < StatusThreshold {
			continue
		}
		out = append(out, Filter{
			Attribute:   AttributeExecutionStatus,
			Type:        TypeKeyword,
			Conditional: ConditionalEquals,
			Value:       status.value,
			Confidence:  probability,
		})
	}
	return out
}

func (p *plan) identifierFilters(answers map[string]typesafe.Answer) []Filter {
	var out []Filter

	if value, confidence, ok := p.selected(answers, questionWorkflowType); ok {
		out = append(out, Filter{
			Attribute:   AttributeWorkflowType,
			Type:        p.attributeType(AttributeWorkflowType),
			Conditional: ConditionalEquals,
			Value:       value,
			Confidence:  confidence,
		})
	}

	if value, confidence, ok := p.selected(answers, questionWorkflowID); ok {
		conditional := ConditionalEquals
		// The prefix judgment contributes in both directions: a noul near 0.5 is a weak
		// judgment for "=" and for STARTS_WITH.
		if probability, answered := p.noul(answers, questionIDIsPrefix); answered {
			if probability >= PrefixThreshold {
				conditional = ConditionalStartsWith
				confidence = min(confidence, probability)
			} else {
				confidence = min(confidence, 1-probability)
			}
		}
		out = append(out, Filter{
			Attribute:   AttributeWorkflowID,
			Type:        p.attributeType(AttributeWorkflowID),
			Conditional: conditional,
			Value:       value,
			Confidence:  confidence,
		})
	}

	if value, confidence, ok := p.selected(answers, questionRunID); ok {
		out = append(out, Filter{
			Attribute:   AttributeRunID,
			Type:        p.attributeType(AttributeRunID),
			Conditional: ConditionalEquals,
			Value:       value,
			Confidence:  confidence,
		})
	}

	return out
}

// keepStrongestPerValue resolves a conflict between questions. They cannot see one
// another, so two of them can claim the same word: "failed" as a status and as the
// value of a Keyword attribute, or "order-123" as a workflow type and as a workflow
// id. One word has one role: the filter with the highest confidence stays. The
// comparison ignores case. A Bool filter takes no part, because its value is not a
// word from the text: IsVip = true and IsActive = true are not in conflict.
func keepStrongestPerValue(filters []Filter) []Filter {
	out := make([]Filter, 0, len(filters))
	for i, filter := range filters {
		strongest := true
		for j, other := range filters {
			if i == j || filter.Type == TypeBool || other.Type == TypeBool || !strings.EqualFold(other.Value, filter.Value) {
				continue
			}
			if other.Confidence > filter.Confidence || (other.Confidence == filter.Confidence && j < i) {
				strongest = false
				break
			}
		}
		if strongest {
			out = append(out, filter)
		}
	}
	return out
}

func (p *plan) customFilters(answers map[string]typesafe.Answer) []Filter {
	var out []Filter
	for _, custom := range p.customs {
		value, confidence, ok := p.selected(answers, custom.id)
		if !ok {
			continue
		}
		out = append(out, Filter{
			Attribute:   custom.name,
			Type:        custom.attributeType,
			Conditional: ConditionalEquals,
			Value:       value,
			Confidence:  confidence,
		})
	}
	return out
}

// timeFilters reads the range, and then only the answers that apply to that range.
// Code does all the calendar math.
func (p *plan) timeFilters(answers map[string]typesafe.Answer) []Filter {
	preset, confidence, ok := p.selected(answers, questionTimeRange)
	if !ok {
		return nil
	}

	var span timeRange
	if preset == rangeCustomRelative {
		amountKey, amountConfidence, amountOK := p.selected(answers, questionTimeAmount)
		unit, unitConfidence, unitOK := p.selected(answers, questionTimeUnit)
		if !amountOK || !unitOK {
			return nil
		}
		span, ok = relativeRange(p.amounts[amountKey], unit, p.local)
		confidence = min(confidence, amountConfidence, unitConfidence)
	} else {
		span, ok = presetRange(preset, p.local)
	}
	if !ok {
		return nil
	}

	direction, directionConfidence, ok := p.selected(answers, questionTimeDirection)
	if !ok {
		return nil
	}
	confidence = min(confidence, directionConfidence)

	// StartTime is the default, so the attribute judgment contributes only when it selects an attribute.
	attribute := AttributeStartTime
	if selectedAttribute, attributeConfidence, ok := p.selected(answers, questionTimeAttribute); ok {
		attribute = selectedAttribute
		confidence = min(confidence, attributeConfidence)
	}

	return span.filters(attribute, direction, confidence)
}
