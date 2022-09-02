/// <reference types="cypress" />

import * as dateTz from 'date-fns-tz';

import tq from '../fixtures/task-queues.json';

describe('Task Queues Page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit(`/namespaces/default/task-queues/a-task-queue`);

    cy.wait('@namespaces-api');
  });

  it('default to last viewed event view when visiting a workflow', () => {
    cy.wait('@task-queues-api');

    cy.get('[data-cy="pollers-title"]').contains('Pollers');
    cy.get('.text-lg').contains('Task Queue: a-task-queue');
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
