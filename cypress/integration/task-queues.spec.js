/// <reference types="cypress" />

import * as dateTz from 'date-fns-tz';

import wtq from '../fixtures/worker-task-queues.json';
import atq from '../fixtures/activity-task-queues.json';

describe('Task Queues Page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit(`/namespaces/default/task-queues/a-task-queue`);

    cy.wait('@namespaces-api');
  });

  it('View a task queue page with a worker', () => {
    cy.wait('@worker-task-queues-api');
    cy.wait('@activity-task-queues-api');

    cy.get('[data-testid="pollers-title"]').contains('Pollers');
    cy.get('.text-lg').contains('Task Queue: a-task-queue');
    cy.get('[data-testid=worker-row]').should('have.length', 1);
    cy.get('[data-testid=worker-identity]').contains(wtq.pollers[0].identity);
    cy.get('[data-testid=worker-last-access-time]').contains(
      dateTz.formatInTimeZone(
        new Date(atq.pollers[0].lastAccessTime),
        'UTC',
        'yyyy-MM-dd z HH:mm:ss.SS',
      ),
    );

    cy.get('[data-testid="workflow-poller"] > .text-blue-700').should('exist');
    cy.get('[data-testid="activity-poller"] > .text-blue-700').should('exist');
  });
});
