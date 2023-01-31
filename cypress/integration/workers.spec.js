/// <reference types="cypress" />

import * as dateTz from 'date-fns-tz';

import workflowCompletedFixture from '../fixtures/workflow-completed.json';
import wtq from '../fixtures/worker-task-queues.json';
import atq from '../fixtures/activity-task-queues.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;
const { name } = workflowCompletedFixture.executionConfig.taskQueue;

describe('Workflow Workers', () => {
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
    cy.wait('@worker-task-queues-api');
    cy.wait('@activity-task-queues-api');
  });

  it('View both worker and activity poller', () => {
    cy.get('[data-cy=worker-row]').should('have.length', 1);
    cy.get('[data-cy=worker-identity]').contains(wtq.pollers[0].identity);
    cy.get('[data-cy=worker-last-access-time]').contains(
      dateTz.formatInTimeZone(
        new Date(atq.pollers[0].lastAccessTime),
        'UTC',
        'yyyy-MM-dd z HH:mm:ss.SS',
      ),
    );

    cy.get('[data-cy="workflow-poller"] > .text-blue-700').should('exist');
    cy.get('[data-cy="activity-poller"] > .text-blue-700').should('exist');
  });
});

describe.skip('Navigate to Workflow Workers', () => {
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
      { fixture: 'event-history-completed.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/history`);

    cy.wait('@namespaces-api');
    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');
  });

  it('View both worker and activity poller', () => {
    cy.url().should('contain', '/history');

    cy.get('[data-cy=workers-tab]').click();

    cy.url().should('contain', '/workers');

    cy.wait('@workflow-api');
    cy.wait('@worker-task-queues-api');
    cy.wait('@activity-task-queues-api');

    cy.get('[data-cy=worker-row]').should('have.length', 1);
    cy.get('[data-cy=worker-identity]').contains(wtq.pollers[0].identity);
    cy.get('[data-cy=worker-last-access-time]').contains(
      dateTz.formatInTimeZone(
        new Date(atq.pollers[0].lastAccessTime),
        'UTC',
        'yyyy-MM-dd z HH:mm:ss.SS',
      ),
    );

    cy.get('[data-cy="workflow-poller"] > .text-blue-700').should('exist');
    cy.get('[data-cy="activity-poller"] > .text-blue-700').should('exist');
  });
});

describe('Workflow Workers - Workflow Worker Only', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/task-queues/${name}?taskQueueType=2`,
      {
        fixture: 'empty-task-queues.json',
      },
    ).as('activity-task-queues-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/workers`);

    cy.wait('@namespaces-api');
    cy.wait('@workflow-api');
    cy.wait('@worker-task-queues-api');
    cy.wait('@activity-task-queues-api');
  });

  it('View workflow worker only poller', () => {
    cy.get('[data-cy=worker-row]').should('have.length', 1);
    cy.get('[data-cy=worker-identity]').contains(wtq.pollers[0].identity);
    cy.get('[data-cy=worker-last-access-time]').contains(
      dateTz.formatInTimeZone(
        new Date(wtq.pollers[0].lastAccessTime),
        'UTC',
        'yyyy-MM-dd z HH:mm:ss.SS',
      ),
    );

    cy.get('[data-cy="workflow-poller"] > .text-blue-700').should('exist');
    cy.get('[data-cy="activity-poller"] > .text-blue-700').should('not.exist');
  });
});

describe('Workflow Workers - Activity Worker Only', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/task-queues/${name}?taskQueueType=1`,
      {
        fixture: 'empty-task-queues.json',
      },
    ).as('worker-task-queues-api');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/workers`);

    cy.wait('@namespaces-api');
    cy.wait('@workflow-api');
    cy.wait('@worker-task-queues-api');
    cy.wait('@activity-task-queues-api');
  });

  it('View activity worker only poller', () => {
    cy.get('[data-cy=worker-row]').should('have.length', 1);
    cy.get('[data-cy=worker-identity]').contains(atq.pollers[0].identity);
    cy.get('[data-cy=worker-last-access-time]').contains(
      dateTz.formatInTimeZone(
        new Date(atq.pollers[0].lastAccessTime),
        'UTC',
        'yyyy-MM-dd z HH:mm:ss.SS',
      ),
    );

    cy.get('[data-cy="workflow-poller"] > .text-blue-700').should('not.exist');
    cy.get('[data-cy="activity-poller"] > .text-blue-700').should('exist');
  });
});
