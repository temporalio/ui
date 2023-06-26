import { test, describe, beforeEach, afterEach, expect } from 'vitest';
import { tick } from 'svelte';
import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
import RetriggerBtn from '$lib/components/workflow/retrigger-button.svelte';

describe('testing re-trigger workflow', () => {
  test('testing retrigger button exist', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const component = new RetriggerBtn({
      target: host,
      props: {
        isRunning: false,
        namespace: 'default',
      },
    });

    const button = document.querySelector('button');
    expect(button.id).toBe('retrigger');
  });

  test('testing modal shows up when button is clicked', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    new RetriggerBtn({
      target: host,
      props: {
        isRunning: false,
        namespace: 'default',
      },
    });

    const modal = document.querySelector('dialog');
    expect(modal).toBeTruthy();
  });

  test('testing retrigger button does not exist', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const component = new RetriggerBtn({
      target: host,
      props: {
        isRunning: true,
        namespace: 'default',
      },
    });

    const button = document.querySelector('button');
    expect(button.id.length).toBeFalsy();
  });
});

// import { retriggerWorkflow } from "$lib/services/workflow-service.js";
// import { workflowRun } from "$lib/stores/workflow-run.js";
// import Modal from "$lib/holocene/modal.svelte";
// import Input from "$lib/holocene/input/input.svelte";
//
// describe("retriggerWorkflow", () => {
//   it("should retrigger the workflow with the given parameters", async () => {
//     // Mock the API response
//     const mockResponse = { ok: true };
//     jest.spyOn(global, "fetch").mockImplementation(() =>
//       Promise.resolve({
//         json: () => Promise.resolve(mockResponse),
//         ok: true
//       })
//     );
//     const result = await retriggerWorkflow({
//       namespace: "test-namespace",
//       workflowId: "test-workflow-id",
//       runId: "test-run-id",
//       reason: "test-reason",
//       eventId: "test-event-id"
//     });
//     // Verify that the API was called with the correct parameters
//     expect(fetch).toHaveBeenCalledWith(
//       "/api/workflows/test-namespace/test-workflow-id/runs/test-run-id/retry",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reason: "test-reason", eventId: "test-event-id" })
//       }
//     );
//     // Verify that the function returns the expected result
//     expect(result).toEqual(mockResponse);
//     // Restore the original fetch function
//     global.fetch.mockRestore();
//   });
//   it("should handle API errors and return an error message", async () => {
//     // Mock the API response
//     const mockResponse = { error: "Failed to retrigger workflow" };
//     jest.spyOn(global, "fetch").mockImplementation(() =>
//       Promise.resolve({
//         json: () => Promise.resolve(mockResponse),
//         ok: false
//       })
//     );
//     const result = await retriggerWorkflow({
//       namespace: "test-namespace",
//       workflowId: "test-workflow-id",
//       runId: "test-run-id",
//       reason: "test-reason",
//       eventId: "test-event-id"
//     });
//     // Verify that the function returns the expected error message
//     expect(result).toEqual(mockResponse);
//     // Restore the original fetch function
//     global.fetch.mockRestore();
//   });
// });
// describe("onRetrigger", () => {
//   it("should open the retrigger confirmation modal", () => {
//     const modal = new Modal();
//     const spy = jest.spyOn(modal, "open");
//     onRetrigger();
//     expect(spy).toHaveBeenCalled();
//   });
// });
// describe("hideRetriggerModal", () => {
//   it("should clear the reason input field", () => {
//     reason = "test-reason";
//     hideRetriggerModal();
//     expect(reason).toBe("");
//   });
// });
// describe("retrigger", () => {
//   it("should call retriggerWorkflow with the correct parameters and close the modal", async () => {
//     const modal = new Modal();
//     const spy = jest.spyOn(modal, "close");
//     // Mock the retriggerWorkflow function
//     jest.spyOn(global, "retriggerWorkflow").mockImplementation(() =>
//       Promise.resolve({ ok: true })
//     );
//     // Set the input values
//     namespace = "test-namespace";
//     $workflowRun = { workflow: { id: "test-workflow-id", runId: "test-run-id" } };
//     reason = "test-reason";
//     eventId = "test-event-id";
//     await retrigger();
//     // Verify that retriggerWorkflow was called with the correct parameters
//     expect(retriggerWorkflow).toHaveBeenCalledWith({
//       namespace: "test-namespace",
//       workflowId: "test-workflow-id",
//       runId: "test-run-id",
//       reason: "test-reason",
//       eventId: "test-event-id"
//     });
//     // Verify that the modal was closed
//     expect(spy).toHaveBeenCalled();
//     // Verify that the reason and eventId inputs were cleared
//     expect(reason).toBe("");
//     expect(eventId).toBe("");
//     // Restore the original retriggerWorkflow function
//     global.retriggerWorkflow.mockRestore();
//   });
//   it("should handle API errors and display an error message", async () => {
//     const modal = new Modal();
//     const spy = jest.spyOn(modal, "close");
//     // Mock the retriggerWorkflow function
//     jest.spyOn(global, "retriggerWorkflow").mockImplementation(() =>
//       Promise.resolve({ error: "Failed to retrigger workflow" })
//     );
//     // Set the input values
//     namespace = "test-namespace";
//     $workflowRun = { workflow: { id: "test-workflow-id", runId: "test-run-id" } };
//     reason = "test-reason";
//     eventId = "test-event-id";
//     await retrigger();
//     // Verify that retriggerWorkflow was called with the correct parameters
//     expect(retriggerWorkflow).toHaveBeenCalledWith({
//       namespace: "test-namespace",
//       workflowId: "test-workflow-id",
//       runId: "test-run-id",
//       reason: "test-reason",
//       eventId: "test-event-id"
//     });
//     // Verify that the modal was not closed
//     expect(spy).not.toHaveBeenCalled();
//     // Verify that the reason and eventId inputs were not cleared
//     expect(reason).toBe("test-reason");
//     expect(eventId).toBe("test-event-id");
//     // Restore the original retriggerWorkflow function
//     global.retriggerWorkflow.mockRestore();
//   });
// });
