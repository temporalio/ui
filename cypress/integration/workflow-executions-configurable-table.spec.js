/// <reference types="cypress" />

describe('Workflow Executions Configurable Table', () => {
  const initialHeaders = [
    'Status',
    'Workflow ID',
    'Run ID',
    'Type',
    'Start',
    'End',
  ];

  const headersToAdd = ['History Size', 'History Length', 'Execution Time'];

  beforeEach(() => {
    cy.interceptApi();
    cy.setTopNavFeatureTag();

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      fixture: 'cluster-with-elasticsearch.json',
    }).as('cluster-api-elasticsearch');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@cluster-api-elasticsearch');
    cy.wait('@settings-api');
    cy.wait('@namespaces-api');
    cy.wait('@search-attributes-api');
    cy.wait('@workflows-api');
    cy.wait('@workflows-count-api');
  });

  it('allows adding and removing columns to the table', () => {
    initialHeaders.forEach((header) => {
      cy.get(
        `[data-testid="workflows-summary-table-header-cell-${header}"]`,
      ).should('exist');
    });

    headersToAdd.forEach((header) => {
      cy.get(
        `[data-testid="workflows-summary-table-header-cell-${header}"]`,
      ).should('not.exist');
    });

    cy.get(
      '[data-testid="workflows-summary-table-configuration-button"]',
    ).click();

    headersToAdd.forEach((header) => {
      cy.get(
        `[data-testid="orderable-list-item-${header}"] [data-testid="orderable-list-item-${header}-add-button"]`,
      ).click();
    });

    cy.get('[data-testid="drawer-close-button"]').click();
    cy.get('[data-testid="unpinned-table-columns-wrapper"]').scrollTo('right');

    headersToAdd.forEach((header) => {
      cy.get(
        `[data-testid="workflows-summary-table-header-cell-${header}"]`,
      ).should('be.visible');
    });

    cy.get(
      '[data-testid="workflows-summary-table-configuration-button"]',
    ).click();

    headersToAdd.forEach((header) => {
      cy.get(
        `[data-testid="orderable-list-item-${header}"] [data-testid="orderable-list-item-${header}-remove-button"]`,
      ).click();
    });

    cy.get('[data-testid="drawer-close-button"]').click();

    headersToAdd.forEach((header) => {
      cy.get(
        `[data-testid="workflows-summary-table-header-cell-${header}"]`,
      ).should('not.exist');
    });
  });

  it('allows reordering columns in the table', () => {
    cy.get('.workflows-summary-table-header-cell')
      .eq(0)
      .should('contain', 'Status');
    cy.get('.workflows-summary-table-header-cell')
      .eq(1)
      .should('contain', 'Workflow ID');
    cy.get('.workflows-summary-table-header-cell')
      .eq(2)
      .should('contain', 'Run ID');
    cy.get('.workflows-summary-table-header-cell')
      .eq(3)
      .should('contain', 'Type');
    cy.get('.workflows-summary-table-header-cell')
      .eq(4)
      .should('contain', 'Start');
    cy.get('.workflows-summary-table-header-cell')
      .eq(5)
      .should('contain', 'End');

    cy.get(
      '[data-testid="workflows-summary-table-configuration-button"]',
    ).click();

    for (let i = 0; i < 3; i++) {
      cy.get(
        '[data-testid="orderable-list-item-Run ID-move-down-button"]',
      ).click();
    }

    cy.get('.workflows-summary-table-header-cell')
      .eq(0)
      .should('contain', 'Status');
    cy.get('.workflows-summary-table-header-cell')
      .eq(1)
      .should('contain', 'Workflow ID');
    cy.get('.workflows-summary-table-header-cell')
      .eq(2)
      .should('contain', 'Type');
    cy.get('.workflows-summary-table-header-cell')
      .eq(3)
      .should('contain', 'Start');
    cy.get('.workflows-summary-table-header-cell')
      .eq(4)
      .should('contain', 'End');
    cy.get('.workflows-summary-table-header-cell')
      .eq(5)
      .should('contain', 'Run ID');
  });
});
