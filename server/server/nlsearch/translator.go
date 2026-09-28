package nlsearch

import (
	"context"
	"errors"
	"fmt"
	"sort"
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
	questionCustomPrefix  = "custom_"

	questionValueAttributePrefix  = "value_attribute_"
	questionValueComparisonPrefix = "value_comparison_"
)

// Option keys that mean "no answer". They are reserved: addOptions drops a candidate
// that is equal to one of them, so the user cannot search for those two literal values.
const (
	optionNone         = "none"
	optionNotMentioned = "not_mentioned"
	optionNotAValue    = "not_a_value"
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
	descriptionAttribute = "In `searchAttributes`."
)

// typeComparisons gives the conditionals that each search attribute type allows,
// the same rules as the filter menu of the UI. A filter never gets a type outside it.
var typeComparisons = map[string][]string{
	TypeKeyword:     {ConditionalEquals, ConditionalNotEquals, ConditionalStartsWith},
	TypeText:        {ConditionalEquals, ConditionalNotEquals},
	TypeKeywordList: {ConditionalEquals, ConditionalNotEquals},
	TypeInt:         {ConditionalEquals, ConditionalNotEquals, ConditionalGreater, ConditionalGreaterOrEqual, ConditionalLess, ConditionalLessOrEqual},
	TypeDouble:      {ConditionalEquals, ConditionalNotEquals, ConditionalGreater, ConditionalGreaterOrEqual, ConditionalLess, ConditionalLessOrEqual},
	TypeBool:        {ConditionalEquals, ConditionalNotEquals},
	TypeDatetime:    {ConditionalGreaterOrEqual, ConditionalLess},
}

// valueTypes are the types whose values are words or numbers from the text.
var valueTypes = map[string]bool{
	TypeKeyword: true, TypeText: true, TypeKeywordList: true, TypeInt: true, TypeDouble: true,
}

// comparisons are the options of each value comparison question.
var comparisons = []struct{ key, conditional, description string }{
	{"equals", ConditionalEquals, "Equal to the value: \"is\", \"=\", \"named\", \"called\", \"for\", \"of\". Select this option when the request gives no other comparison."},
	{"not_equals", ConditionalNotEquals, "Not equal to the value: \"is not\", \"except\", \"other than\", \"excluding\", \"without\"."},
	{"starts_with", ConditionalStartsWith, "Starts with the value: \"starts with\", \"begins with\", \"prefixed with\", \"beginning with\", or a value that ends with *."},
	{"greater", ConditionalGreater, "Greater than the value: \"more than\", \"greater than\", \"above\", \"over\"."},
	{"greater_or_equal", ConditionalGreaterOrEqual, "Greater than or equal to the value: \"at least\", \"or more\", \"minimum\"."},
	{"less", ConditionalLess, "Less than the value: \"less than\", \"fewer than\", \"below\", \"under\"."},
	{"less_or_equal", ConditionalLessOrEqual, "Less than or equal to the value: \"at most\", \"or fewer\", \"maximum\"."},
}

func allows(attributeType, conditional string) bool {
	for _, allowed := range typeComparisons[attributeType] {
		if allowed == conditional {
			return true
		}
	}
	return false
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

	filters := p.filters(res.Answers)
	return newResult(filters, p.trace(res.Answers)), nil
}

func newResult(filters []Filter, trace []TraceStep) Result {
	result := Result{Filters: filters, Understood: len(filters) > 0, Trace: trace}
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
	values    []string
	asked     []askedQuestion
	steps     map[string]*TraceStep
}

func newPlan(in Input) *plan {
	p := &plan{
		in:        in,
		local:     localNow(in.Now, in.TimezoneOffsetMinutes),
		questions: map[string]typesafe.Question{},
		steps:     map[string]*TraceStep{},
	}

	p.addStatusQuestions()
	p.addTimeQuestions()
	p.addIdentifierQuestions()
	p.addValueQuestions()
	p.addCustomQuestions()

	return p
}

// state is the content that every question reads.
func (p *plan) state() map[string]any {
	names := make([]string, 0, len(p.in.SearchAttributes))
	for name, attributeType := range p.in.SearchAttributes {
		if _, known := typeComparisons[attributeType]; known {
			names = append(names, name)
		}
	}
	sort.Strings(names)

	searchAttributes := make([]map[string]any, 0, len(names))
	for _, name := range names {
		attributeType := p.in.SearchAttributes[name]
		searchAttributes = append(searchAttributes, map[string]any{
			"name":        name,
			"type":        attributeType,
			"comparisons": typeComparisons[attributeType],
		})
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
		"searchAttributes":   searchAttributes,
		"knownWorkflowTypes": knownWorkflowTypes,
	}
}

func (p *plan) addStatusQuestions() {
	for _, status := range executionStatuses {
		p.ask(questionStatusPrefix+status.value, TraceStatus, status.value, typesafe.NewNoul(
			fmt.Sprintf("`text` is a request to search workflow executions. Does the user want workflows with the execution status %s? That status means %s.", status.value, status.meaning),
			fmt.Sprintf("The request names the status %s, a synonym of it, or a group of statuses that includes it (for example, \"closed\" or \"not running\" includes each status other than Running).", status.value),
			fmt.Sprintf("The request does not mention the status %s, or it excludes that status.", status.value),
		))
	}
}

func (p *plan) addTimeQuestions() {
	timestamps := typesafe.ChoiceCriteria{
		AttributeStartTime:     "The time the workflow started: \"started\", \"began\", \"launched\", \"created\", \"ran\".",
		AttributeCloseTime:     "The time the workflow closed: \"closed\", \"finished\", \"ended\", \"completed at\", \"failed at\".",
		AttributeExecutionTime: "The time the workflow was scheduled to execute, for a delayed or cron workflow: \"scheduled for\", \"execution time\".",
	}
	for _, name := range p.attributesOfType(TypeDatetime) {
		if _, exists := timestamps[name]; !exists && len(timestamps) < maxCandidates {
			timestamps[name] = fmt.Sprintf("The custom timestamp attribute %s.", name)
		}
	}
	timestamps[optionNone] = "There is no time expression, or the request does not say which timestamp it applies to."
	p.ask(questionTimeAttribute, TraceTimeAttribute, "", typesafe.NewChoice(
		"`text` is a request to search workflow executions. If it has a time expression, which timestamp of the workflow does the time expression apply to? The timestamps are the Datetime entries of `searchAttributes`.",
		timestamps,
	))

	p.ask(questionTimeRange, TraceTimeRange, "", typesafe.NewChoice(
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
	))

	p.ask(questionTimeUnit, TraceTimeUnit, "", typesafe.NewChoice(
		"`text` is a request to search workflow executions. If it gives a span of time as a number and a unit, which unit is it?",
		typesafe.ChoiceCriteria{
			unitMinutes: "Minutes: \"min\", \"mins\", \"m\".",
			unitHours:   "Hours: \"hr\", \"hrs\", \"h\".",
			unitDays:    "Days: \"d\".",
			unitWeeks:   "Weeks: \"wk\", \"w\".",
			unitMonths:  "Months.",
			optionNone:  "The request gives no span of time with a unit.",
		},
	))

	p.ask(questionTimeDirection, TraceTimeDirection, "", typesafe.NewChoice(
		"`text` is a request to search workflow executions. Does the user want workflows inside the named period of time, or workflows from before it?",
		typesafe.ChoiceCriteria{
			directionWithinRange: "Inside the period: \"in the last 3 hours\", \"from yesterday\", \"today\", \"since Monday\", \"newer than 2 days\". Also select this option when there is no period of time.",
			directionOlderThan:   "Before the period: \"older than 3 days\", \"more than 2 weeks ago\", \"before yesterday\", \"not in the last hour\".",
		},
	))

	amounts, values := amountCandidates(p.in.Text)
	p.amounts = values

	options := typesafe.ChoiceCriteria{}
	addOptions(options, amounts, descriptionNumber, maxCandidates)
	if len(options) == 0 {
		return
	}
	options[optionNone] = "No number in the request is an amount of time."
	p.ask(questionTimeAmount, TraceTimeAmount, "", typesafe.NewChoice(
		"`text` is a request to search workflow executions. Which number is the amount of the span of time, such as the 3 in \"last 3 hours\" or in \"older than three days\"? Number words are given as digits. A number that is part of a name or an id is not an amount of time.",
		options,
	))
}

func (p *plan) addIdentifierQuestions() {
	if !p.hasAttribute(AttributeWorkflowType) {
		return
	}
	options := typesafe.ChoiceCriteria{}
	addOptions(options, p.in.KnownWorkflowTypes, descriptionKnownType, maxCandidates)
	addOptions(options, identifierCandidates(p.in.Text), descriptionTyped, maxCandidates)
	if len(options) == 0 {
		return
	}
	options[optionNone] = "The request names no workflow type, or no option matches the named type. A value that the request gives as a workflow id or a run id is not a workflow type."
	p.ask(questionWorkflowType, TraceWorkflowType, "", typesafe.NewChoice(
		"`text` is a request to search workflow executions. Which option is the workflow type that the user wants? A workflow type is the name of a workflow definition, such as OrderWorkflow. The user can write it loosely: \"order workflows\" means OrderWorkflow when that option exists.",
		options,
	))
}

// addValueQuestions asks, for each value in the text, which search attribute it
// filters on and how it is compared. The options are every attribute in
// `searchAttributes` whose values are words or numbers, so the model can build a
// filter on any of them. The two questions of a value run in parallel: code keeps
// the comparison only when the type of the selected attribute allows it.
func (p *plan) addValueQuestions() {
	var names []string
	for _, name := range p.attributeNames() {
		if name != AttributeExecutionStatus && valueTypes[p.attributeType(name)] {
			names = append(names, name)
		}
	}
	if len(names) == 0 {
		return
	}

	attributes := typesafe.ChoiceCriteria{}
	for _, name := range names {
		if len(attributes) >= maxCandidates {
			break
		}
		attributes[name] = descriptionAttribute
	}
	attributes[optionNotAValue] = "The value is not a value to filter on: it is part of a phrase, it names an attribute, a status, or a time, or it is a filler word."

	comparisonOptions := typesafe.ChoiceCriteria{}
	for _, comparison := range comparisons {
		comparisonOptions[comparison.key] = comparison.description
	}

	p.values = valueCandidates(p.in.Text, append(p.attributeNames(), AttributeExecutionStatus, AttributeStartTime, AttributeCloseTime, AttributeExecutionTime))
	for i, value := range p.values {
		index := strconv.Itoa(i)
		p.ask(questionValueAttributePrefix+index, TraceValueAttribute, value, typesafe.NewChoice(
			fmt.Sprintf("`text` is a request to search workflow executions. It contains the value %q. Which search attribute from `searchAttributes` does the user want to filter on with %q? A word that is part of an attribute name, such as \"id\" or \"type\", or a word that names a comparison, such as \"starts\" or \"more\", is not a value. For example, in \"workflow id starts with agent\", the value agent filters on WorkflowId.", value, value),
			attributes,
		))
		p.ask(questionValueComparisonPrefix+index, TraceValueComparison, value, typesafe.NewChoice(
			fmt.Sprintf("`text` is a request to search workflow executions. It contains the value %q. If the user filters on %q, how does the user compare the attribute to %q?", value, value, value),
			comparisonOptions,
		))
	}
}

func (p *plan) addCustomQuestions() {
	seen := map[string]bool{}
	for _, name := range p.in.CustomAttributeNames {
		if len(p.customs) == MaxCustomAttributes {
			return
		}
		if seen[name] || p.in.SearchAttributes[name] != TypeBool {
			continue
		}
		seen[name] = true

		custom := customQuestion{
			id:            questionCustomPrefix + strconv.Itoa(len(p.customs)),
			name:          name,
			attributeType: TypeBool,
		}
		p.ask(custom.id, TraceCustom, name, typesafe.NewChoice(
			fmt.Sprintf("`text` is a request to search workflow executions. Workflows have a custom true or false attribute with the name %q. Which value of %q does the user want?", name, name),
			typesafe.ChoiceCriteria{
				optionTrue:         fmt.Sprintf("The user wants workflows where %q is true.", name),
				optionFalse:        fmt.Sprintf("The user wants workflows where %q is false.", name),
				optionNotMentioned: fmt.Sprintf("The request puts no condition on %q.", name),
			},
		))
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
		if candidate == "" || candidate == optionNone || candidate == optionNotMentioned || candidate == optionNotAValue {
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
	_, known := typeComparisons[p.in.SearchAttributes[name]]
	return known
}

// attributeNames gives the names of the search attributes that a filter can use, sorted.
func (p *plan) attributeNames() []string {
	names := make([]string, 0, len(p.in.SearchAttributes))
	for name := range p.in.SearchAttributes {
		if p.hasAttribute(name) {
			names = append(names, name)
		}
	}
	sort.Strings(names)
	return names
}

// attributesOfType gives the sorted names of the search attributes of one type.
func (p *plan) attributesOfType(attributeType string) []string {
	var names []string
	for _, name := range p.attributeNames() {
		if p.attributeType(name) == attributeType {
			names = append(names, name)
		}
	}
	return names
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

	step := p.observe(answers, id)
	step.Threshold = threshold(MinChoiceConfidence)
	answer, ok := answers[id]
	if !ok {
		step.Outcome = OutcomeMissing
		return "", 0, false
	}
	if _, sent := options[answer.Choice]; !sent {
		step.Outcome = OutcomeNoMatch
		return "", 0, false
	}
	if answer.Choice == optionNone || answer.Choice == optionNotMentioned || answer.Choice == optionNotAValue {
		step.Outcome = OutcomeNoMatch
		return "", 0, false
	}
	confidence, ok := answer.ChoiceConfidence()
	if !ok || confidence < MinChoiceConfidence {
		step.Outcome = OutcomeBelowThreshold
		return "", 0, false
	}

	step.Outcome = OutcomeKept
	return answer.Choice, confidence, true
}

// noul gives the probability of true for a noul question, and records it in the
// trace against the threshold that the caller applies.
func (p *plan) noul(answers map[string]typesafe.Answer, id string, minimum float64) (float64, bool) {
	if _, asked := p.questions[id]; !asked {
		return 0, false
	}
	step := p.observe(answers, id)
	step.Threshold = threshold(minimum)
	answer, ok := answers[id]
	if !ok || answer.Noul == nil {
		step.Outcome = OutcomeMissing
		return 0, false
	}
	if *answer.Noul >= minimum {
		step.Outcome = OutcomeKept
	} else {
		step.Outcome = OutcomeBelowThreshold
	}
	return *answer.Noul, true
}

// filters builds the filters from the answers that apply, then removes each filter
// whose attribute the request does not have.
func (p *plan) filters(answers map[string]typesafe.Answer) []Filter {
	var all []Filter
	all = append(all, p.statusFilters(answers)...)
	all = append(all, p.identifierFilters(answers)...)
	all = append(all, p.valueFilters(answers)...)
	all = append(all, p.customFilters(answers)...)
	strongest := keepStrongestPerValue(all)
	p.markDropped(all, strongest, OutcomeConflict)
	all = append(strongest, p.timeFilters(answers)...)

	out := make([]Filter, 0, len(all))
	for _, filter := range all {
		if p.hasAttribute(filter.Attribute) {
			out = append(out, filter)
		}
	}
	p.markDropped(all, out, OutcomeUnavailable)
	return out
}

func (p *plan) statusFilters(answers map[string]typesafe.Answer) []Filter {
	var out []Filter
	for _, status := range executionStatuses {
		id := questionStatusPrefix + status.value
		probability, ok := p.noul(answers, id, StatusThreshold)
		if !ok || probability < StatusThreshold {
			continue
		}
		filter := Filter{
			Attribute:   AttributeExecutionStatus,
			Type:        TypeKeyword,
			Conditional: ConditionalEquals,
			Value:       status.value,
			Confidence:  probability,
		}
		p.attach(answers, id, filter)
		out = append(out, filter)
	}
	return out
}

func (p *plan) identifierFilters(answers map[string]typesafe.Answer) []Filter {
	value, confidence, ok := p.selected(answers, questionWorkflowType)
	if !ok {
		return nil
	}
	filter := Filter{
		Attribute:   AttributeWorkflowType,
		Type:        p.attributeType(AttributeWorkflowType),
		Conditional: ConditionalEquals,
		Value:       value,
		Confidence:  confidence,
	}
	p.attach(answers, questionWorkflowType, filter)
	return []Filter{filter}
}

// valueFilters builds one filter for each value whose attribute the model selected.
// The comparison defaults to "=" when its answer is below the threshold. A
// comparison that the type of the attribute does not allow, or a value that does
// not fit the type, gives no filter.
func (p *plan) valueFilters(answers map[string]typesafe.Answer) []Filter {
	conditionals := map[string]string{}
	for _, comparison := range comparisons {
		conditionals[comparison.key] = comparison.conditional
	}

	var out []Filter
	for i, value := range p.values {
		index := strconv.Itoa(i)
		attributeID := questionValueAttributePrefix + index
		attribute, confidence, ok := p.selected(answers, attributeID)
		if !ok {
			continue
		}
		attributeType := p.attributeType(attribute)

		conditional := ConditionalEquals
		if key, comparisonConfidence, ok := p.selected(answers, questionValueComparisonPrefix+index); ok {
			conditional = conditionals[key]
			confidence = min(confidence, comparisonConfidence)
		}

		if attribute == AttributeWorkflowType {
			known, ok := p.knownWorkflowType(value)
			if !ok {
				p.observe(answers, attributeID).Outcome = OutcomeIncomplete
				continue
			}
			value = known
		}

		if !allows(attributeType, conditional) || !fitsType(attributeType, value) {
			p.observe(answers, attributeID).Outcome = OutcomeIncomplete
			continue
		}

		filter := Filter{
			Attribute:   attribute,
			Type:        attributeType,
			Conditional: conditional,
			Value:       value,
			Confidence:  confidence,
		}
		p.attach(answers, attributeID, filter)
		out = append(out, filter)
	}
	return out
}

// knownWorkflowType gives the known workflow type that a value names, without
// regard to case. A value that names no known type gives no filter, because a
// WorkflowType filter must match exactly: the workflow type question handles
// loose names such as "order" for OrderWorkflow. Without known types, the value
// stays as the user typed it.
func (p *plan) knownWorkflowType(value string) (string, bool) {
	if len(p.in.KnownWorkflowTypes) == 0 {
		return value, true
	}
	for _, known := range p.in.KnownWorkflowTypes {
		if strings.EqualFold(known, value) {
			return known, true
		}
	}
	return "", false
}

func fitsType(attributeType, value string) bool {
	switch attributeType {
	case TypeInt:
		_, err := strconv.ParseInt(value, 10, 64)
		return err == nil
	case TypeDouble:
		_, err := strconv.ParseFloat(value, 64)
		return err == nil
	}
	return true
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
		filter := Filter{
			Attribute:   custom.name,
			Type:        custom.attributeType,
			Conditional: ConditionalEquals,
			Value:       value,
			Confidence:  confidence,
		}
		p.attach(answers, custom.id, filter)
		out = append(out, filter)
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

	incomplete := func() []Filter {
		p.observe(answers, questionTimeRange).Outcome = OutcomeIncomplete
		return nil
	}

	var span timeRange
	if preset == rangeCustomRelative {
		amountKey, amountConfidence, amountOK := p.selected(answers, questionTimeAmount)
		unit, unitConfidence, unitOK := p.selected(answers, questionTimeUnit)
		if !amountOK || !unitOK {
			return incomplete()
		}
		span, ok = relativeRange(p.amounts[amountKey], unit, p.local)
		confidence = min(confidence, amountConfidence, unitConfidence)
	} else {
		span, ok = presetRange(preset, p.local)
	}
	if !ok {
		return incomplete()
	}

	direction, directionConfidence, ok := p.selected(answers, questionTimeDirection)
	if !ok {
		return incomplete()
	}
	confidence = min(confidence, directionConfidence)

	// StartTime is the default, so the attribute judgment contributes only when it selects an attribute.
	attribute := AttributeStartTime
	if selectedAttribute, attributeConfidence, ok := p.selected(answers, questionTimeAttribute); ok {
		attribute = selectedAttribute
		confidence = min(confidence, attributeConfidence)
	}

	filters := span.filters(attribute, direction, confidence)
	p.attach(answers, questionTimeRange, filters...)
	return filters
}
