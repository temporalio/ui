package nlsearch

import (
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

var (
	quotedRe = regexp.MustCompile("\"([^\"]+)\"|'([^']+)'|`([^`]+)`|“([^”]+)”|‘([^’]+)’")
	uuidRe   = regexp.MustCompile(`(?i)\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b`)
	amountRe = regexp.MustCompile(`^\d{1,4}$`)

	numberWords = map[string]int{
		"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
		"seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
	}

	// stopWords are tokens that are never the value of a Keyword attribute: plain
	// function words, and the words that belong to the status and time questions.
	// Without them, "failed order workflows" can give CustomerTier = "failed".
	stopWords = wordSet(
		// Function words and search verbs.
		"a", "an", "the", "of", "in", "on", "at", "to", "by", "for", "from", "with", "and", "or",
		"is", "are", "was", "were", "be", "that", "which", "where", "whose", "than", "not", "all",
		"any", "me", "my", "show", "find", "list", "get", "workflow", "workflows",
		// Status words.
		"running", "open", "active", "completed", "complete", "succeeded", "successful", "failed",
		"failing", "failure", "failures", "errored", "canceled", "cancelled", "terminated", "killed",
		"continued", "continuedasnew", "timed", "timedout", "timeout", "closed", "finished", "status",
		// Time words.
		"today", "yesterday", "tomorrow", "now", "tonight", "morning", "night", "last", "past",
		"since", "ago", "before", "after", "older", "newer", "more", "less", "within", "this",
		"previous", "recent", "recently", "started", "ended", "began", "scheduled",
		"minute", "minutes", "min", "mins", "hour", "hours", "hr", "hrs", "day", "days",
		"week", "weeks", "wk", "wks", "month", "months", "quarter", "year", "years",
	)
)

const tokenTrimSet = ".,;:!?()[]{}<>\"'`“”‘’"

func wordSet(words ...string) map[string]bool {
	out := make(map[string]bool, len(words))
	for _, word := range words {
		out[word] = true
	}
	return out
}

// tokens splits the text on white space and removes the punctuation around each token.
func tokens(text string) []string {
	var out []string
	for _, field := range strings.Fields(text) {
		if token := strings.Trim(field, tokenTrimSet); token != "" {
			out = append(out, token)
		}
	}
	return out
}

// quotedStrings returns the contents of the quoted spans of the text.
func quotedStrings(text string) []string {
	var out []string
	for _, match := range quotedRe.FindAllStringSubmatch(text, -1) {
		for _, group := range match[1:] {
			if span := strings.TrimSpace(group); span != "" {
				out = append(out, span)
			}
		}
	}
	return out
}

// isIdentifierLike reports whether a token looks like a name or an id and not like a
// plain word: it has a digit, an inner separator, or an inner capital letter.
// A number alone is not identifier-like, because it is usually an amount of time.
// The user can put a numeric id in quotes.
func isIdentifierLike(token string) bool {
	var hasDigit, hasLetter, hasInnerUpper, hasSeparator bool
	for i, r := range token {
		switch {
		case unicode.IsDigit(r):
			hasDigit = true
		case unicode.IsLetter(r):
			hasLetter = true
			if i > 0 && unicode.IsUpper(r) {
				hasInnerUpper = true
			}
		case strings.ContainsRune("_-.:/", r):
			hasSeparator = true
		}
	}

	if hasSeparator {
		return hasLetter || hasDigit
	}
	if hasDigit {
		return hasLetter
	}
	return hasInnerUpper && strings.ToUpper(token) != token
}

// identifierCandidates finds the text spans that can be a workflow type or a workflow id.
// The finder is tuned to find too many: the model selects, so an extra candidate is cheap.
func identifierCandidates(text string) []string {
	out := quotedStrings(text)
	for _, token := range tokens(text) {
		if isIdentifierLike(token) {
			out = append(out, token)
		}
	}
	return dedupe(out)
}

// uuidCandidates finds the text spans that can be a run id.
func uuidCandidates(text string) []string {
	return dedupe(uuidRe.FindAllString(text, -1))
}

// keywordCandidates finds the text spans that can be the value of a Keyword attribute.
// It skips the stop words, the status and time words, and the amounts.
func keywordCandidates(text string) []string {
	out := quotedStrings(text)
	for _, token := range tokens(text) {
		lower := strings.ToLower(token)
		if _, isNumberWord := numberWords[lower]; isNumberWord {
			continue
		}
		if len(token) < 2 || stopWords[lower] || amountRe.MatchString(token) {
			continue
		}
		out = append(out, token)
	}
	return dedupe(out)
}

// amountCandidates finds the whole numbers in the text, in text order. Each
// candidate is the digit form that goes to the model. Number words from one to
// twelve become digits. The map gives the number for each candidate.
func amountCandidates(text string) ([]string, map[string]int) {
	var keys []string
	values := map[string]int{}

	for _, token := range tokens(text) {
		n, ok := numberWords[strings.ToLower(token)]
		if !ok {
			if !amountRe.MatchString(token) {
				continue
			}
			parsed, err := strconv.Atoi(token)
			if err != nil || parsed <= 0 {
				continue
			}
			n = parsed
		}

		key := strconv.Itoa(n)
		if _, seen := values[key]; !seen {
			keys = append(keys, key)
			values[key] = n
		}
	}
	return keys, values
}

// dedupe removes repeated values and values that are too long, and keeps the order.
// It also removes each value with a double quote, a backtick, or a backslash: such a
// value can break out of the quotes of the query that the frontend builds.
func dedupe(values []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(values))
	for _, value := range values {
		if seen[value] || len(value) > MaxNameLength || strings.ContainsAny(value, "\"`\\") {
			continue
		}
		seen[value] = true
		out = append(out, value)
	}
	return out
}
