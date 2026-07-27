package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/labstack/echo/v4"
	"go.temporal.io/api/common/v1"
	"go.temporal.io/api/workflowservice/v1"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

const WorkflowRawHistoryUrl = "/namespaces/:namespace/workflows/:workflow/run/:runid/history.json"

func WorkflowRawHistoryHandler(service IWorkflowService) echo.HandlerFunc {
	return func(c echo.Context) error {
		// url decode workflow param
		value := c.Param("workflow")
		decodedValue, err := url.QueryUnescape(value)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid workflow ID: %s", value))
		}

		// Set headers for JSON streaming
		c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		c.Response().WriteHeader(http.StatusOK)

		// // Stream the history events
		return NewRawHistory().
			SetIDs(
				c.Param("namespace"),
				decodedValue,
				c.Param("runid"),
			).
			SetContext(c.Request().Context()).
			SetWriter(c.Response().Writer).
			SetWorkflowService(service).
			StreamEvents()
	}
}

type IWorkflowService interface {
	GetWorkflowExecutionHistory(
		ctx context.Context,
		in *workflowservice.GetWorkflowExecutionHistoryRequest,
		opts ...grpc.CallOption,
	) (*workflowservice.GetWorkflowExecutionHistoryResponse, error)
}

func NewRawHistory() *RawHistory {
	return &RawHistory{}
}

type RawHistory struct {
	namespace  string
	workflowID string
	runID      string

	writtenCount int

	context context.Context
	writer  http.ResponseWriter
	encoder *json.Encoder
	service IWorkflowService
}

func (rh *RawHistory) SetIDs(
	namespace string,
	workflowID string,
	runID string,
) *RawHistory {
	rh.namespace = namespace
	rh.workflowID = workflowID
	rh.runID = runID

	return rh
}

func (rh *RawHistory) SetContext(c context.Context) *RawHistory {
	rh.context = c

	return rh
}

func (rh *RawHistory) SetWriter(w http.ResponseWriter) *RawHistory {
	rh.writer = w
	rh.encoder = json.NewEncoder(rh.writer)

	return rh
}

func (rh *RawHistory) SetWorkflowService(service IWorkflowService) *RawHistory {
	rh.service = service

	return rh
}

func (rh *RawHistory) StreamEvents() error {
	// Write opening of response object
	fmt.Fprint(rh.writer, "[")

	// Write the history events
	err := rh.streamEvents()
	if err != nil {
		rh.handleError(err)
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
			rh.writtenCount++
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

	return rh.service.GetWorkflowExecutionHistory(rh.context, request)
}

func (rh *RawHistory) handleError(err error) {
	if rh.writtenCount > 0 {
		fmt.Fprint(rh.writer, ",")
	}

	fmt.Fprintf(rh.writer, `{"error": "%s"}`, err)
}
