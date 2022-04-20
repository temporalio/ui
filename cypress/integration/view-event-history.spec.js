/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflow = workflowsFixture.executions[0];
const { workflowId, runId } = workflow?.execution;

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'completed-event-history.json' },
    ).as('event-history-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/query*`,
      { fixture: 'query.json' },
    ).as('query-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/task-queues/rainbow-statuses?taskQueueType=*`,
      {
        pollers: [
          {
            lastAccessTime: '2022-04-11T13:21:10.910333429Z',
            identity: '57979@MacBook-Pro@',
            ratePerSecond: 100000,
          },
        ],
        taskQueueStatus: null,
      },
    ).as('queue-api');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');
  });

  it('default to the summary page when visiting a workflow', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.url().should('contain', '/summary');
  });

  it('default to last viewed event view when visiting a workflow', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.url().should('contain', '/summary');

    cy.get(
      '[href="/namespaces/default/workflows/b12453_Completed/db7b0929-24bc-424c-a935-a1f8da69755e/history/full?per-page=100"]',
    ).click();
    cy.url().should('contain', '/full');

    cy.visit('/namespaces/default/workflows');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);
    cy.url().should('contain', '/full');
  });
});
