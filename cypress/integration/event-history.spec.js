/// <reference types="cypress" />

import { formatDistanceToNow } from 'date-fns';
import * as dateTz from 'date-fns-tz';

import workflowCompletedFixture from '../fixtures/workflow-completed.json';
import eventsFixtureDescending from '../fixtures/event-history-completed-reverse.json';
import eventsFixtureAscending from '../fixtures/event-history-completed.json';

const [firstEventInDescendingOrder] = eventsFixtureDescending.history.events;

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

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?nextPageToken=*`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-ascending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?nextPageToken=*`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-ascending-all');
  });

  it('default to the summary page when visiting a workflow', () => {
    cy.clearLocalStorage();

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.url().should('contain', '/history');

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');
  });

  it('default to last viewed event view when visiting a workflow', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.url().should('contain', '/history');

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-cy="feed"]').should('have.class', 'active');
    cy.get('[data-cy="compact"]').should('not.have.class', 'active');
    cy.get('[data-cy="json"]').should('not.have.class', 'active');

    cy.get('[data-cy="event-summary-row"]')
      .should('not.have.length', 0)
      .should('have.length', eventsFixtureDescending.history.events.length);

    cy.get('[data-cy="compact"]').click();

    cy.wait('@event-history-ascending');

    cy.visit('/namespaces/default/workflows');

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.url().should('contain', '/history');

    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-ascending');

    cy.get('[data-cy="compact"]').should('have.class', 'active');
    cy.get('[data-cy="json"]').should('not.have.class', 'active');
    cy.get('[data-cy="feed"]').should('not.have.class', 'active');

    cy.get('[data-cy="event-summary-row"]')
      .should('not.have.length', 0)
      .should('not.have.length', eventsFixtureDescending.history.events.length);
  });

  it('should render events in feed view', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-cy="event-summary-row"]').should(
      'have.length',
      eventsFixtureDescending.history.events.length,
    );

    cy.get('table').contains(firstEventInDescendingOrder.eventId);
  });

  it('should render event time in various formats', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    const dt = new Date(eventsFixtureDescending.history.events[0].eventTime);

    cy.get('[data-cy=event-date-filter-button]').click();
    cy.get('[data-cy=event-date-filter-relative]').click();
    const relative = formatDistanceToNow(dt);
    cy.get('table').contains(relative);

    cy.get('[data-cy=event-date-filter-button]').click();
    cy.get('[data-cy=event-date-filter-UTC]').click();
    const utc = dateTz.formatInTimeZone(dt, 'UTC', 'yyyy-MM-dd z HH:mm:ss.SS');
    cy.get('table').contains(utc);

    cy.get('[data-cy=event-date-filter-button]').click();
    cy.get('[data-cy=event-date-filter-local]').click();
    const local = dateTz.format(dt, 'yyyy-MM-dd z HH:mm:ss.SS');
    cy.get('table').contains(local);
  });

  it('should render events in compact view', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-cy="compact"]').click();

    cy.wait('@event-history-ascending');

    cy.get('[data-cy="event-summary-row"]')
      .should('not.have.length', 0)
      .should('not.have.length', eventsFixtureDescending.history.events.length);
  });

  it('should be viewable as JSON', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');

    cy.get('[data-cy="json"]').click();

    cy.wait('@event-history-ascending-all');

    const match = eventsFixtureAscending.history.events[0].eventTime;
    cy.get('[data-cy="event-history-json"]').contains(match);
  });
});
