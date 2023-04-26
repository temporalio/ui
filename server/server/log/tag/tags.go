package tag

import (
	"fmt"
	"strings"
	"time"
)

const (
	errorPrefix = "*"
)

// ==========  Common tags defined here ==========

// Error returns tag for Error
func Error(err error) ZapTag {
	return NewErrorTag(err)
}

// ErrorType returns tag for ErrorType
func ErrorType(err error) ZapTag {
	return NewStringTag("service-error-type", strings.TrimPrefix(fmt.Sprintf("%T", err), errorPrefix))
}

// Timestamp returns tag for Timestamp
func Timestamp(timestamp time.Time) ZapTag {
	return NewTimeTag("timestamp", timestamp)
}

// ==========  System tags defined here:  ==========
// Tags with pre-define values

// Event returns tag for Event
func event(action string) ZapTag {
	return NewStringTag("action", action)
}

// ErrorType returns tag for ErrorType
func errorType(errorType string) ZapTag {
	return NewStringTag("error-type", errorType)
}
