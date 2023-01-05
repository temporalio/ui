package main

import (
	"log"

	"github.com/temporalio/ui/e2e"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func main() {
	c, err := client.Dial(client.Options{
		DataConverter: e2e.DataConverter,
	})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	w1 := worker.New(c, "e2e-1", worker.Options{})

	w1.RegisterWorkflow(e2e.Workflow)
	w1.RegisterActivity(e2e.Activity)

	// Second task queue has only the workflow registered.
	// This allows us to ensure there is a pending activity as there are no workers polling for activities on this queue.
	w2 := worker.New(c, "e2e-2", worker.Options{
		LocalActivityWorkerOnly: true,
	})

	w2.RegisterWorkflow(e2e.Workflow)

	errCh := make(chan error, 2)
	go func() { errCh <- w1.Run(worker.InterruptCh()) }()
	go func() { errCh <- w2.Run(worker.InterruptCh()) }()
	for i := 0; i < 2; i++ {
		if err = <-errCh; err != nil {
			log.Fatal(err)
		}
	}
}
