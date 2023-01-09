/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflow = workflowsFixture.executions[0];
const { workflowId, runId } = workflow.execution;
const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-empty.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-empty.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?nextPageToken=*`,
      { fixture: 'event-history-empty.json' },
    ).as('event-history-descending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?nextPageToken=*`,
      { fixture: 'event-history-empty.json' },
    ).as('event-history-ascending');
  });

  it(`should show an empty state in the feed view`, () => {
    cy.visit(workflowUrl + `/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.contains('No Events Match');
  });

  it(`should show an empty state in the compact view`, () => {
    cy.visit(workflowUrl + `/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-cy="compact"]').click();

    cy.wait('@event-history-ascending');

    cy.contains('No Events Match');
  });

  it('should display a custom empty state if there are events, but no event groups', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?nextPageToken=*`,
      { fixture: 'event-history-with-no-activities.json' },
    ).as('event-history-descending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?nextPageToken=*`,
      { fixture: 'event-history-with-no-activities.json' },
    ).as('event-history-ascending');

    cy.visit(workflowUrl + `/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-cy="compact"]').click();

    cy.wait('@event-history-ascending');

    cy.contains('No Events Match');
  });
});
