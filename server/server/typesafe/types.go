// Package typesafe is a small HTTP client for the TypeSafe System One API.
//
// A System One model (such as Jev) does not generate text. It answers typed
// questions (noul, choice, score) about a state and returns probabilities.
package typesafe

import "encoding/json"

// QuestionType is the kind of judgment that a question asks for.
type QuestionType string

const (
	// QuestionTypeNoul is a yes or no judgment, returned as a probability.
	QuestionTypeNoul QuestionType = "noul"
	// QuestionTypeChoice selects one option from a defined set.
	QuestionTypeChoice QuestionType = "choice"
	// QuestionTypeScore places the state on an ordered scale.
	QuestionTypeScore QuestionType = "score"

	// MaxChoiceOptions is the maximum number of options that one choice question allows.
	MaxChoiceOptions = 255
)

type (
	// Request is the body of a System One evaluation.
	Request struct {
		Model string `json:"model"`
		// State is the content to evaluate: a string, an object, or an array.
		State any `json:"state"`
		// Questions maps a caller-chosen id to a question. The model does not see the id.
		Questions map[string]Question `json:"questions"`
	}

	// Question is one typed question. Use NewNoul, NewChoice, or NewScore to build one.
	Question struct {
		Type QuestionType `json:"type"`
		// Instructions is a string, an object, or an array.
		Instructions any `json:"instructions"`
		// Criteria depends on the type: NoulCriteria, ChoiceCriteria, or ScoreCriteria.
		Criteria any `json:"criteria"`
	}

	// NoulCriteria describes what true and false mean.
	NoulCriteria struct {
		True  string `json:"true"`
		False string `json:"false"`
	}

	// ChoiceCriteria maps an option key to its description.
	ChoiceCriteria map[string]string

	// ScoreCriteria holds 2 to 10 level descriptions, lowest first.
	ScoreCriteria []string

	// Response is the body of a successful System One evaluation.
	Response struct {
		Model   string            `json:"model"`
		Answers map[string]Answer `json:"answers"`
		Usage   Usage             `json:"usage"`
	}

	// Answer is one typed answer. Only the fields for its type are set.
	Answer struct {
		Type QuestionType `json:"type"`
		// Noul is the probability that the answer is true.
		Noul *float64 `json:"noul,omitempty"`
		// Choice is the key of the selected option.
		Choice        string             `json:"choice,omitempty"`
		Probabilities map[string]float64 `json:"probabilities,omitempty"`
		// Confidence is the confidence in the selected option. It is nil when the
		// response does not have it. Use ChoiceConfidence to read it.
		Confidence *float64        `json:"confidence,omitempty"`
		Score      *float64        `json:"score,omitempty"`
		Legend     json.RawMessage `json:"legend,omitempty"`
	}

	// Usage reports the tokens that the evaluation used.
	Usage struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	}
)

// NewNoul builds a yes or no question.
func NewNoul(instructions, whenTrue, whenFalse string) Question {
	return Question{
		Type:         QuestionTypeNoul,
		Instructions: instructions,
		Criteria:     NoulCriteria{True: whenTrue, False: whenFalse},
	}
}

// NewChoice builds a question that selects one of the given options.
func NewChoice(instructions string, options ChoiceCriteria) Question {
	return Question{
		Type:         QuestionTypeChoice,
		Instructions: instructions,
		Criteria:     options,
	}
}

// NewScore builds a question that places the state on the given levels.
func NewScore(instructions string, levels ScoreCriteria) Question {
	return Question{
		Type:         QuestionTypeScore,
		Instructions: instructions,
		Criteria:     levels,
	}
}

// ChoiceConfidence gives the confidence in the selected option of a choice answer.
// It falls back to the probability of the selected option when the answer has no
// confidence. It is false when the answer has neither: treat that as below each threshold.
func (a Answer) ChoiceConfidence() (float64, bool) {
	if a.Confidence != nil {
		return *a.Confidence, true
	}
	if probability, ok := a.Probabilities[a.Choice]; ok {
		return probability, true
	}
	return 0, false
}
