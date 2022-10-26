/// <reference types="cypress" />
import * as dateTz from 'date-fns-tz';

import workflowRunningWithParentFixture from '../fixtures/workflow-running-with-parent.json';
import workflowCompletedFixture from '../fixtures/workflow-completed.json';

const { workflowId, runId } =
  workflowRunningWithParentFixture.workflowExecutionInfo.execution;

describe('Workflow Events', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse*`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events?`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-ascending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running-with-parent.json' },
    ).as('workflow-api');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should be able to get workflow details in header and navigation to parent workflow', () => {
    cy.clearLocalStorage();

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-descending');

    cy.url().should('contain', '/feed');

    // Contains workflow information
    cy.get('[data-cy="workflow-type"]').contains(
      workflowRunningWithParentFixture.workflowExecutionInfo.type.name,
    );
    cy.get('[data-cy="run-id"]').contains(runId);

    const start = new Date(
      workflowRunningWithParentFixture.workflowExecutionInfo.startTime,
    );
    const startLocal = dateTz.formatInTimeZone(
      start,
      'UTC',
      'yyyy-MM-dd z HH:mm:ss.SS',
    );
    cy.get('[data-cy="start-time"]').contains(startLocal);

    cy.get('[data-cy="close-time"]').should('have.value', '');

    cy.get('[data-cy="task-queue"]').contains(
      workflowRunningWithParentFixture.executionConfig.taskQueue.name,
    );
    cy.get('[data-cy="state-transitions"]').contains(
      workflowRunningWithParentFixture.workflowExecutionInfo
        .stateTransitionCount,
    );

    // Contains parent workflow information and link
    cy.get('[data-cy="parent-workflow-id"]')
      .find('a')
      .contains(
        workflowRunningWithParentFixture.workflowExecutionInfo.parentExecution
          .workflowId,
      );
    cy.get('[data-cy="parent-run-id"]')
      .find('a')
      .contains(
        workflowRunningWithParentFixture.workflowExecutionInfo.parentExecution
          .runId,
      );

    // Navigate to parent workflow
    cy.get('[data-cy="parent-workflow-id"]').find('a').click();

    cy.url().should(
      'contain',
      workflowCompletedFixture.workflowExecutionInfo.execution.workflowId,
    );
    cy.url().should(
      'contain',
      workflowCompletedFixture.workflowExecutionInfo.execution.runId,
    );
  });
});
