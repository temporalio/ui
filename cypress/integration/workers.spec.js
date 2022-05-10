/// <reference types="cypress" />

import * as dateTz from 'date-fns-tz';

import workflowCompletedFixture from '../fixtures/workflow-completed.json';
import tq from '../fixtures/task-queues.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;

describe('Workflow Events', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/workers`);

    cy.wait('@namespaces-api');
    cy.wait('@workflow-api');
  });

  it('default to last viewed event view when visiting a workflow', () => {
    cy.get('[data-cy=workers-tab]').click();
    cy.wait('@task-queues-api');

    cy.get('[data-cy=worker-row]').should('have.length', 1);
    cy.get('[data-cy=worker-identity]').contains(tq.pollers[0].identity);
    cy.get('[data-cy=worker-last-access-time]').contains(
      dateTz.formatInTimeZone(
        new Date(tq.pollers[0].lastAccessTime),
        'UTC',
        'yyyy-MM-dd z HH:mm:ss.SS',
      ),
    );
  });
});
