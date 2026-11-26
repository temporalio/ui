// A real Temporal worker hosted as a Bedrock AgentCore Runtime.
//
// AgentCore has no async invoke, so temporal-auto-scaled-workers calls
// /invocations and closes the response stream immediately. The intended shape
// is therefore: start the worker in the background, answer 200 right away, and
// keep polling for the life of the AgentCore session.
package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

// Greet is the workflow we prove executes on an AgentCore-hosted worker.
func Greet(ctx workflow.Context, name string) (string, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("Greet running inside AgentCore", "name", name)
	var out string
	err := workflow.ExecuteActivity(
		workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
			StartToCloseTimeout: 30 * time.Second,
		}),
		Hello, name,
	).Get(ctx, &out)
	return out, err
}

func Hello(ctx context.Context, name string) (string, error) {
	host, _ := os.Hostname()
	return "hello " + name + " from AgentCore worker on " + host, nil
}

var start sync.Once

func startWorker(deploymentName, buildID string) {
	addr := os.Getenv("TEMPORAL_ADDRESS")
	ns := os.Getenv("TEMPORAL_NAMESPACE")
	tq := os.Getenv("TEMPORAL_TASK_QUEUE")
	if ns == "" {
		ns = "default"
	}
	log.Printf("WORKER starting addr=%s ns=%s tq=%s deployment=%s build=%s",
		addr, ns, tq, deploymentName, buildID)

	c, err := client.Dial(client.Options{HostPort: addr, Namespace: ns})
	if err != nil {
		log.Printf("WORKER dial failed: %v", err)
		return
	}

	w := worker.New(c, tq, worker.Options{
		DeploymentOptions: worker.DeploymentOptions{
			UseVersioning: true,
			Version: worker.WorkerDeploymentVersion{
				DeploymentName: deploymentName,
				BuildID:        buildID,
			},
		},
	})
	// With UseVersioning the SDK requires an explicit versioning behavior on
	// every registered workflow. Pinned keeps a run on the version that
	// started it, which is what a serverless worker wants: the AgentCore
	// session that picked the task is the one that finishes it.
	w.RegisterWorkflowWithOptions(Greet, workflow.RegisterOptions{
		VersioningBehavior: workflow.VersioningBehaviorPinned,
	})
	w.RegisterActivity(Hello)

	log.Printf("WORKER polling task queue %q as %s.%s", tq, deploymentName, buildID)
	if err := w.Run(worker.InterruptCh()); err != nil {
		log.Printf("WORKER exited: %v", err)
	}
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status": "Healthy", "time_of_last_update": time.Now().Unix(),
		})
	})

	mux.HandleFunc("/invocations", func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		log.Printf("INVOKED payload=%s", string(body))

		var in struct {
			DeploymentName string `json:"deploymentName"`
			BuildID        string `json:"buildId"`
		}
		_ = json.Unmarshal(body, &in)

		// Only ever one worker per container; later invokes are scale-up
		// signals for a worker that is already polling.
		start.Do(func() { go startWorker(in.DeploymentName, in.BuildID) })

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok": true, "workerStarted": true,
			"deploymentName": in.DeploymentName, "buildId": in.BuildID,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("agentcore-worker listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
