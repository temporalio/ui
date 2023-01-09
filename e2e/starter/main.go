package main

import (
	"context"
	"log"

	"github.com/temporalio/ui/e2e"
	"go.temporal.io/sdk/client"
)

func main() {
	c, err := client.Dial(client.Options{
		DataConverter: e2e.DataConverter,
	})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	_, err = c.ExecuteWorkflow(
		context.Background(),
		client.StartWorkflowOptions{
			ID:        "e2e-workflow-2",
			TaskQueue: "e2e-2",
		},
		e2e.Workflow,
		"Plain text input 2",
	)
	if err != nil {
		log.Fatalln("Unable to execute workflow", err)
	}

	we, err := c.ExecuteWorkflow(
		context.Background(),
		client.StartWorkflowOptions{
			ID:        "e2e-workflow-1",
			TaskQueue: "e2e-1",
		},
		e2e.Workflow,
		"Plain text input 1",
	)
	if err != nil {
		log.Fatalln("Unable to execute workflow", err)
	}

	var result string
	err = we.Get(context.Background(), &result)
	if err != nil {
		log.Fatalln("Unable get workflow result", err)
	}
}
