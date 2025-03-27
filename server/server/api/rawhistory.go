package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/temporalio/ui-server/v2/server/config"
	"go.temporal.io/api/common/v1"
	"go.temporal.io/api/workflowservice/v1"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

const WorkflowRawHistoryUrl = "/namespaces/:namespace/workflows/:workflow/run/:runid/history.json"

func WorkflowRawHistoryHandler(
	cfgProvider *config.ConfigProviderWithRefresh,
	conn *grpc.ClientConn,
) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Set headers for JSON streaming
		c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		c.Response().WriteHeader(http.StatusOK)

		// // Stream the history events
		return NewRawHistory().
			SetIDs(c).
			SetContext(c).
			SetWriter(c).
			SetTemporalClient(conn).
			StreamEvents()
	}
}

func NewRawHistory() *RawHistory {
	return &RawHistory{}
}

type RawHistory struct {
	namespace  string
	workflowID string
	runID      string

	context context.Context
	writer  http.ResponseWriter
	encoder *json.Encoder
	client  workflowservice.WorkflowServiceClient
}

func (rh *RawHistory) SetIDs(c echo.Context) *RawHistory {
	rh.namespace = c.Param("namespace")
	rh.workflowID = c.Param("workflow")
	rh.runID = c.Param("runid")

	return rh
}

func (rh *RawHistory) SetContext(c echo.Context) *RawHistory {
	rh.context = c.Request().Context()

	return rh
}

func (rh *RawHistory) SetWriter(c echo.Context) *RawHistory {
	rh.writer = c.Response().Writer
	rh.encoder = json.NewEncoder(rh.writer)

	return rh
}

func (rh *RawHistory) SetTemporalClient(conn *grpc.ClientConn) *RawHistory {
	rh.client = workflowservice.NewWorkflowServiceClient(conn)

	return rh
}

func (rh *RawHistory) StreamEvents() error {
	// Write opening of response object
	fmt.Fprint(rh.writer, "[")

	// Write the history events
	err := rh.streamEvents()
	if err != nil {
		fmt.Fprintf(rh.writer, `{ "error": %v }`, err)
	}

	fmt.Fprint(rh.writer, "]")
	return nil
}

// streamEvents handles the actual event streaming with pagination
func (rh *RawHistory) streamEvents() error {
	var nextPageToken []byte
	isFirstEvent := true

	writer := rh.writer
	encoder := rh.encoder

	for {
		// Get a page of history
		response, err := rh.fetchPage(nextPageToken)
		if err != nil {
			return err
		}

		// Stream each event in this page
		for _, event := range response.History.Events {
			// Add comma separator between events
			if !isFirstEvent {
				fmt.Fprint(writer, ",")
			} else {
				isFirstEvent = false
			}

			// Write event directly to response
			if err := encoder.Encode(event); err != nil {
				return err
			}

			// Flush to ensure streaming
			writer.(http.Flusher).Flush()
		}

		// Check if we're done
		nextPageToken = response.NextPageToken
		if len(nextPageToken) == 0 {
			break
		}
	}

	return nil
}

// fetchHistoryPage gets a single page of workflow history
func (rh *RawHistory) fetchPage(
	nextPageToken []byte,
) (*workflowservice.GetWorkflowExecutionHistoryResponse, error) {
	request := &workflowservice.GetWorkflowExecutionHistoryRequest{
		Namespace: rh.namespace,
		Execution: &common.WorkflowExecution{
			WorkflowId: rh.workflowID,
			RunId:      rh.runID,
		},
		NextPageToken: nextPageToken,
	}

	return rh.client.GetWorkflowExecutionHistory(rh.context, request)
}
