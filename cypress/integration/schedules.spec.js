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

describe('Schedules Create', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/schedules');

    cy.wait('@namespaces-api');
    cy.wait('@schedules-api');
  });

  it('should show Create Schedules Button and navigate to /new', () => {
    cy.get('[data-cy="create-schedule"]').click();
    cy.url().should('contain', '/schedules/new');
    cy.get('#content').contains('Create Schedule');
  });
});
