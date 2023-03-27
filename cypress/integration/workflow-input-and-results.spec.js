/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';
import eventsCompletedFixture from '../fixtures/event-history-completed.json';
import eventsCompletedNullFixture from '../fixtures/event-history-completed-null.json';
import eventsRunningFixture from '../fixtures/event-history-running.json';
import eventsFailedFixture from '../fixtures/event-history-failed.json';
import eventsCanceledFixture from '../fixtures/event-history-canceled.json';
import eventsContinuedAsNewFixture from '../fixtures/event-history-continued-as-new.json';
import eventsTimedOutFixture from '../fixtures/event-history-timed-out.json';

const workflow = workflowsFixture.executions[0];
const { workflowId, runId } = workflow.execution;

describe('Workflow Input and Results', () => {
  beforeEach(() => {
    cy.interceptApi();
    cy.setTopNavFeatureTag();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should show the input and result for completed workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsCompletedFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);

    const lastEvent =
      eventsCompletedFixture.history.events[
        eventsCompletedFixture.history.events.length - 1
      ];
    const results = Buffer.from(
      lastEvent.workflowExecutionCompletedEventAttributes.result.payloads[0]
        .data,
      'base64',
    ).toString();

    cy.get('[data-testid="workflow-results"]').contains(results);
  });

  it('should show the input and result for completed workflow and null result', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-completed-null.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-completed-null.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-completed-null.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsCompletedNullFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);

    const lastEvent =
      eventsCompletedNullFixture.history.events[
        eventsCompletedNullFixture.history.events.length - 1
      ];
    const results = String(
      lastEvent.workflowExecutionCompletedEventAttributes.result,
    );
    cy.get('[data-testid="workflow-results"]').contains(results);
  });

  it('should show the input and result for running workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsRunningFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);
    cy.get('[data-testid="workflow-results"]').contains(
      'Results will appear upon completion',
    );
  });

  it('should show the input and results for failed workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-failed.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-failed.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-failed.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsFailedFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);

    const lastEvent =
      eventsFailedFixture.history.events[
        eventsFailedFixture.history.events.length - 1
      ];
    const results = String(
      lastEvent.workflowExecutionFailedEventAttributes.failure.cause.message,
    );
    cy.get('[data-testid="workflow-results"]').contains(results);
  });

  it('should show the input and results for cancelled workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-canceled.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-canceled.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-canceled.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsCanceledFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);
    cy.get('[data-testid="workflow-results"]').contains('Canceled');
  });

  it('should show the input and results for timed out workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-timed-out.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-timed-out.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-timed-out.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsTimedOutFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);
    cy.get('[data-testid="workflow-results"]').contains('Timeout');
  });

  it('should show the input and continued as new input for continued as new workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-continued-as-new.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-continued-as-new.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-continued-as-new.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-testid="input-and-results"]').click();

    const firstEvent = eventsContinuedAsNewFixture.history.events[0];
    const lastEvent =
      eventsContinuedAsNewFixture.history.events[
        eventsContinuedAsNewFixture.history.events.length - 1
      ];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    const result = Buffer.from(
      lastEvent.workflowExecutionContinuedAsNewEventAttributes.input.payloads[0]
        .data,
      'base64',
    ).toString();
    cy.get('[data-testid="workflow-input"]').contains(input);
    cy.get('[data-testid="workflow-results"]').contains(result);
  });
});
