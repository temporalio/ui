/// <reference types="cypress" />

import * as dateTz from 'date-fns-tz';

import wtq from '../fixtures/worker-task-queues.json';
import atq from '../fixtures/activity-task-queues.json';

describe('Task Queues Page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit(`/namespaces/default/task-queues/a-task-queue`);

    cy.wait('@namespaces-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/task-queues/a-task-queue?taskQueueType=1`,
      {
        fixture: 'worker-task-queues.json',
      },
    ).as('worker-task-queues-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/task-queues/a-task-queue?taskQueueType=2`,
      {
        fixture: 'activity-task-queues.json',
      },
    ).as('activity-task-queues-api');
  });

  it('View a task queue page with a worker', () => {
    cy.wait('@worker-task-queues-api');
    cy.wait('@activity-task-queues-api');

    cy.get('[data-cy="pollers-title"]').contains('Pollers');
    cy.get('.text-lg').contains('Task Queue: a-task-queue');
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
