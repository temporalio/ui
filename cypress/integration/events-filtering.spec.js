/// <reference types="cypress" />

import { formatDistanceToNow } from 'date-fns';
import * as dateTz from 'date-fns-tz';

import workflowCompletedFixture from '../fixtures/workflow-completed.json';
import eventsFixture from '../fixtures/event-history-completed.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;

describe('Events filtering, sorting and formatting', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse*`,
      { fixture: 'event-history-reverse-running.json' },
    ).as('event-history-reverse-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
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
      { fixture: 'workflow-completed.json' },
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

  it('should sort events by Start Time ascending and descending', () => {
    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed`,
    );

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    function expectEventTimeSorting(direction = '') {
      let prevTime;
      cy.get(`[data-cy=event-summary-row-${direction}]`).each(($el) => {
        const timeTxt = $el.find('[data-cy=event-summary-time]').text();
        const time = new Date(timeTxt);

        if (prevTime) {
          if (direction === '') {
            expect(time).to.be.gte(prevTime);
          } else {
            expect(time).to.be.lte(prevTime);
          }
        }
        prevTime = time;
      });
    }

    expectEventTimeSorting();

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-sort-reverse]',
    ).click();
    cy.wait('@event-history-reverse-api');
    expectEventTimeSorting('reverse');

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-sort-]',
    ).click();
    cy.wait('@event-history-api');
    expectEventTimeSorting();
  });

  it('should show event time as Elapsed Time', () => {
    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed`,
    );

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-show-elapsed-time]',
    ).click();

    const firstEvent = new Date(eventsFixture.history.events[0].eventTime);
    cy.get('[data-cy=event-summary-time]')
      .first()
      .contains(firstEvent.getFullYear());
    cy.get('[data-cy=event-summary-time]').contains('(+');
  });

  it('should filter events by category', () => {
    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed`,
    );

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-category-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-category-filter-activity]',
    ).click();
    const count = eventsFixture.history.events.filter((e) =>
      e.eventType.contains('Activity'),
    ).length;
    cy.get('[data-cy=event-summary-row-]').should('have.length', count);
    cy.get('[data-cy=event-summary-row-]').each(($el) => {
      cy.wrap($el).contains('Activity');
    });
  });

  it('should format event time in local, UTC and relative times', () => {
    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed`,
    );

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    const dt = new Date(eventsFixture.history.events[0].eventTime);

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-relative]',
    ).click();
    const relative = formatDistanceToNow(dt);
    cy.get('[data-cy=event-summary-table]').contains(relative);

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-UTC]',
    ).click();
    const utc = dateTz.formatInTimeZone(dt, 'UTC', 'yyyy-MM-dd z HH:mm:ss.SS');
    cy.get('[data-cy=event-summary-table]').contains(utc);

    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-button]',
    ).click();
    cy.get(
      '[data-cy=event-summary-table-header-desktop] [data-cy=event-date-filter-local]',
    ).click();
    const local = dateTz.format(dt, 'yyyy-MM-dd z HH:mm:ss.SS');
    cy.get('[data-cy=event-summary-table]').contains(local);
  });
});
