/// <reference types="cypress" />

import workflowFixture from '../fixtures/workflow.json';
import eventsFixture from '../fixtures/event-history-completed.json';

const { workflowId, runId } = workflowFixture.workflowExecutionInfo.execution;

describe('Workflow Events', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse*`,
      { fixture: 'event-history-completed.json' },
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
    cy.clearLocalStorage();

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.url().should('contain', '/feed');
  });

  it('default to last viewed event view when visiting a workflow', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.url().should('contain', '/feed');

    cy.get('[data-cy="feed"]').click();
    cy.url().should('contain', '/feed');

    cy.visit('/namespaces/default/workflows');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);
    cy.url().should('contain', '/feed');
  });

  it('should be viewable as JSON', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.get('[data-cy="json"]').click();

    const match = eventsFixture.history.events[0].eventTime;
    cy.get('[data-cy="event-history-json"]').contains(match);
  });
});
