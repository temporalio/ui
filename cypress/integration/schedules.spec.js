/// <reference types="cypress" />

import schedulesFixture from '../fixtures/schedules.json';

const scheduleFixture = schedulesFixture.schedules[0];
const {
  scheduleId,
  info: {
    workflowType: { name },
  },
} = scheduleFixture;

describe('Schedules List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/schedules');

    cy.wait('@namespaces-api');
    cy.wait('@schedules-api');
  });

  it('should show schedule ID and workflow name in first row', () => {
    cy.get('.schedule-row').first().contains(scheduleId);
    cy.get('.schedule-row').first().contains(name);
  });
});

describe('Schedules View', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/schedules');

    cy.wait('@namespaces-api');
    cy.wait('@schedules-api');
  });

  it('should navigate to a schedule and view the name and frequency', () => {
    cy.get('.schedule-row').first().contains(scheduleId);
    cy.get('.schedule-row').first().contains(name);

    cy.get('.schedule-row').first().click();

    cy.wait('@schedule-api');

    cy.get('[data-cy="schedule-name"]').should('exist');
    cy.get('[data-cy="schedule-name"]').contains(scheduleId);

    cy.get('[data-cy="schedule-interval-frequency"]').contains('Every 30sec');
  });
});

describe('Schedules Edit', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/schedules');

    cy.wait('@namespaces-api');
    cy.wait('@schedules-api');
  });

  it('should navigate to a schedule and click edit', () => {
    cy.get('.schedule-row').first().contains(scheduleId);
    cy.get('.schedule-row').first().contains(name);

    cy.get('.schedule-row').first().click();

    cy.wait('@schedule-api');

    cy.get('[data-cy="schedule-name"]').should('exist');
    cy.get('[data-cy="schedule-name"]').contains(scheduleId);

    cy.get('[data-cy="schedule-interval-frequency"]').contains('Every 30sec');

    cy.get('#schedule-actions-menu-button').click();
    cy.get('#schedule-actions-menu > .edit').click();
    cy.url().should('contain', `/schedules/${scheduleId}/edit`);
    cy.get('#content').contains('Edit Schedule');
  });
});

describe('Schedules Create', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/schedules');

    cy.wait('@namespaces-api');
    cy.wait('@schedules-api');
  });

  it('should show Create Schedules Button and navigate to /create', () => {
    cy.get('[data-cy="create-schedule"]').click();
    cy.url().should('contain', '/schedules/create');
    cy.get('#content').contains('Create Schedule');
  });
});
