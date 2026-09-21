package nlsearch

import "time"

// Time range presets. The keys are the option keys of the time range question.
const (
	rangeLast15Minutes  = "last_15_minutes"
	rangeLastHour       = "last_hour"
	rangeLast3Hours     = "last_3_hours"
	rangeLast24Hours    = "last_24_hours"
	rangeToday          = "today"
	rangeYesterday      = "yesterday"
	rangeThisWeek       = "this_week"
	rangeLast7Days      = "last_7_days"
	rangeLast30Days     = "last_30_days"
	rangeLast90Days     = "last_90_days"
	rangeCustomRelative = "custom_relative"
)

// Time units of a custom relative range.
const (
	unitMinutes = "minutes"
	unitHours   = "hours"
	unitDays    = "days"
	unitWeeks   = "weeks"
	unitMonths  = "months"
)

// Time directions.
const (
	directionWithinRange = "within_range"
	directionOlderThan   = "older_than"
)

// timeRange is a span of time. A zero end means that the range has no upper bound.
type timeRange struct {
	start time.Time
	end   time.Time
}

// localNow returns now in the fixed zone of the user.
func localNow(now time.Time, timezoneOffsetMinutes int) time.Time {
	return now.In(time.FixedZone("user", timezoneOffsetMinutes*60))
}

func startOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

// presetRange does the calendar math for a preset. The day and week presets use the
// day boundaries of the user. The week starts on Monday.
func presetRange(preset string, local time.Time) (timeRange, bool) {
	switch preset {
	case rangeLast15Minutes:
		return timeRange{start: local.Add(-15 * time.Minute)}, true
	case rangeLastHour:
		return timeRange{start: local.Add(-time.Hour)}, true
	case rangeLast3Hours:
		return timeRange{start: local.Add(-3 * time.Hour)}, true
	case rangeLast24Hours:
		return timeRange{start: local.Add(-24 * time.Hour)}, true
	case rangeToday:
		return timeRange{start: startOfDay(local)}, true
	case rangeYesterday:
		today := startOfDay(local)
		return timeRange{start: today.AddDate(0, 0, -1), end: today}, true
	case rangeThisWeek:
		daysSinceMonday := (int(local.Weekday()) + 6) % 7
		return timeRange{start: startOfDay(local).AddDate(0, 0, -daysSinceMonday)}, true
	case rangeLast7Days:
		return timeRange{start: local.AddDate(0, 0, -7)}, true
	case rangeLast30Days:
		return timeRange{start: local.AddDate(0, 0, -30)}, true
	case rangeLast90Days:
		return timeRange{start: local.AddDate(0, 0, -90)}, true
	}
	return timeRange{}, false
}

// relativeRange does the calendar math for "the last <amount> <unit>".
func relativeRange(amount int, unit string, local time.Time) (timeRange, bool) {
	if amount <= 0 {
		return timeRange{}, false
	}

	switch unit {
	case unitMinutes:
		return timeRange{start: local.Add(-time.Duration(amount) * time.Minute)}, true
	case unitHours:
		return timeRange{start: local.Add(-time.Duration(amount) * time.Hour)}, true
	case unitDays:
		return timeRange{start: local.AddDate(0, 0, -amount)}, true
	case unitWeeks:
		return timeRange{start: local.AddDate(0, 0, -7*amount)}, true
	case unitMonths:
		return timeRange{start: local.AddDate(0, -amount, 0)}, true
	}
	return timeRange{}, false
}

// filters builds the filters for the range. "Older than" means before the start of the range.
func (r timeRange) filters(attribute, direction string, confidence float64) []Filter {
	newFilter := func(conditional string, t time.Time) Filter {
		return Filter{
			Attribute:   attribute,
			Type:        TypeDatetime,
			Conditional: conditional,
			Value:       t.UTC().Format(time.RFC3339),
			Confidence:  confidence,
		}
	}

	if direction == directionOlderThan {
		return []Filter{newFilter(ConditionalLess, r.start)}
	}

	out := []Filter{newFilter(ConditionalGreaterOrEqual, r.start)}
	if !r.end.IsZero() {
		out = append(out, newFilter(ConditionalLess, r.end))
	}
	return out
}
