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
const { workflowId, runId } = workflow?.execution;

describe('Workflow Input and Results', () => {
  beforeEach(() => {
    cy.interceptApi();

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
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsCompletedFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);

    const lastEvent =
      eventsCompletedFixture.history.events[
        eventsCompletedFixture.history.events.length - 1
      ];
    const results = Buffer.from(
      lastEvent.workflowExecutionCompletedEventAttributes.result.payloads[0]
        .data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-results"]').contains(results);
  });

  it('should show the input and result for completed workflow and null result', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-completed-null.json' },
    ).as('event-history-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsCompletedNullFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);

    const lastEvent =
      eventsCompletedNullFixture.history.events[
        eventsCompletedNullFixture.history.events.length - 1
      ];
    const results = String(
      lastEvent.workflowExecutionCompletedEventAttributes.result,
    );
    cy.get('[data-cy="workflow-results"]').contains(results);
  });

  it('should show the input and result for running workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-api');
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsRunningFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);
    cy.get('[data-cy="workflow-results"]').contains('In progress');
  });

  it('should show the input and results for failed workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-failed.json' },
    ).as('event-history-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsFailedFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);

    const lastEvent =
      eventsFailedFixture.history.events[
        eventsFailedFixture.history.events.length - 1
      ];
    const results = String(
      lastEvent.workflowExecutionFailedEventAttributes.failure.cause.message,
    );
    cy.get('[data-cy="workflow-results"]').contains(results);
  });

  it('should show the input and results for cancelled workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-canceled.json' },
    ).as('event-history-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsCanceledFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);
    cy.get('[data-cy="workflow-results"]').contains('Canceled');
  });

  it('should show the input and results for timed out workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-timed-out.json' },
    ).as('event-history-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsTimedOutFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);
    cy.get('[data-cy="workflow-results"]').contains('Timeout');
  });

  it('should show the input and results for continued as new workflow', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-continued-as-new.json' },
    ).as('event-history-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');

    const firstEvent = eventsContinuedAsNewFixture.history.events[0];
    const input = Buffer.from(
      firstEvent.workflowExecutionStartedEventAttributes.input.payloads[0].data,
      'base64',
    ).toString();
    cy.get('[data-cy="workflow-input"]').contains(input);
    cy.get('[data-cy="workflow-results"]').contains('ContinuedAsNew');
  });
});
