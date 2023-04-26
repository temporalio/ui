package log

import "github.com/temporalio/ui-server/v2/server/log/tag"

type (
	// Logger is the logging interface.
	// Usage example:
	//  logger.Info("hello world",
	//          tag.WorkflowNextEventID(123),
	//          tag.WorkflowActionWorkflowStarted,
	//          tag.WorkflowNamespaceID("test-namespace-id")),
	//	 )
	//  Note: msg should be static, do not use fmt.Sprintf() for msg. Anything dynamic should be tagged.
	Logger interface {
		Debug(msg string, tags ...tag.Tag)
		Info(msg string, tags ...tag.Tag)
		Warn(msg string, tags ...tag.Tag)
		Error(msg string, tags ...tag.Tag)
		DPanic(msg string, tags ...tag.Tag)
		Panic(msg string, tags ...tag.Tag)
		Fatal(msg string, tags ...tag.Tag)
	}
)
