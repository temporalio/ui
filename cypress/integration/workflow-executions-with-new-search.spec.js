/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflowRunningFixture = workflowsFixture.executions[0];
const { workflowId, runId } = workflowRunningFixture.execution;

describe('Workflow Executions List With Search', () => {
  beforeEach(() => {
    cy.interceptApi();
    cy.setTopNavFeatureTag();
    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      fixture: 'cluster-with-elasticsearch.json',
    }).as('cluster-api-elasticsearch');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@cluster-api-elasticsearch');
    cy.wait('@namespaces-api');
    cy.wait('@workflows-api');
  });

  it('should default to All for the time range', () => {
    cy.get('#time-range-filter').should('have.value', '');
  });

  describe('Workflow Manual Search', () => {
    it('should change url on manual search and update filters and show results count', () => {
      cy.get('#manual-search').type('WorkflowType="ImportantWorkflowType"');
      cy.get('[data-testid="manual-search-button"]').click();

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      cy.url().should('contain', result);

      cy.get('[data-testid="workflow-type-filter-button"]').click();
      cy.get('#workflowType').should('have.value', 'ImportantWorkflowType');

      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });
  });

  describe('Workflow Filters', () => {
    it('should send the correct query for Workflow Type, autocomplete manual search and be clearable', () => {
      cy.get('[data-testid="workflow-type-filter-button"]').click();

      cy.get('#workflowType').type('ImportantWorkflowType');

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'WorkflowType="ImportantWorkflowType"',
      );

      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );

      cy.get(
        '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
      ).click();

      cy.url().should('not.contain', result);
    });

    it('should send the correct query for Workflow ID, autocomplete manual search and be clearable', () => {
      cy.get('[data-testid="workflow-id-filter-button"]').click();

      cy.get('#workflowId').type('002c98_Running');

      const result = encodeURIComponent('WorkflowId="002c98_Running"');
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'WorkflowId="002c98_Running"',
      );
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );

      cy.get(
        '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
      ).click();

      cy.url().should('not.contain', result);
    });

    it('should change url on single Execution Status change', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();

      const result = encodeURIComponent('ExecutionStatus="Running"');
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'ExecutionStatus="Running"',
      );
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });

    it('should change url on multiple Execution Status change', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();
      cy.get('[data-testid="Failed"]').click();

      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        '(ExecutionStatus="Running" OR ExecutionStatus="Failed")',
      );
    });

    it('should clear Execution Status on All', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();
      cy.get('[data-testid="Failed"]').click();

      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      cy.url().should('contain', result);

      cy.get('[data-testid="All"]').click();
      cy.url().should('contain.not', result);
    });

    it('should combine all three filters', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();

      cy.get('[data-testid="workflow-id-filter-button"]').click();
      cy.get('#workflowId').type('002c98_Running');

      cy.get('[data-testid="workflow-type-filter-button"]').click();
      cy.get('#workflowType').type('ImportantWorkflowType');

      const result =
        'ExecutionStatus%3D%22Running%22+AND+WorkflowId%3D%22002c98_Running%22+AND+WorkflowType%3D%22ImportantWorkflowType%22';
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'ExecutionStatus="Running" AND WorkflowId="002c98_Running" AND WorkflowType="ImportantWorkflowType"',
      );
    });

    it('should send the correct query for StartTime', () => {
      cy.get('#time-range-filter').click();
      cy.contains('15 minutes').click();

      cy.url().should('contain', 'StartTime+%3E');
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });

    it('should send the correct query for CloseTime', () => {
      cy.get('#time-range-filter').click();
      cy.contains('3 hours').click();
      cy.contains('End Time').click();

      cy.url().should('contain', 'CloseTime+%3E');
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });

    describe('Workflow Filters with Navigation ', () => {
      beforeEach(() => {
        cy.interceptApi();

        cy.intercept(
          Cypress.env('VITE_API_HOST') +
            `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse*`,
          { fixture: 'event-history-completed.json' },
        ).as('event-history-api');

        cy.intercept(
          Cypress.env('VITE_API_HOST') +
            `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
          { fixture: 'workflow-completed.json' },
        ).as('workflow-api');
      });

      it('should keep single workflow filter after navigating away and back to workflow list', () => {
        cy.get('[data-testid="execution-status-filter-button"]').click();
        cy.get('[data-testid="Running"]').click();
        cy.get('body').click(0, 0); // close the Workflow Status filter dropdown

        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="Running"`),
        );

        cy.get('.workflow-summary-configurable-row').first().click();

        cy.wait('@workflow-api');
        cy.wait('@event-history-api');

        cy.url().should('contain', '/history');
        cy.get('[data-testid="back-to-workflows"]').click();

        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="Running"`),
        );
        cy.get('[data-testid="workflow-count"]').should(
          'have.text',
          'Results 15 of 15 workflows',
        );
      });
    });
  });
});

describe('Workflow Executions List With Search using only MySql on 1.20', () => {
  beforeEach(() => {
    cy.interceptApi();
    cy.setTopNavFeatureTag();
    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      fixture: 'cluster-with-mysql.json',
    }).as('cluster-api-elasticsearch');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@cluster-api-elasticsearch');
    cy.wait('@namespaces-api');
    cy.wait('@workflows-api');
  });

  it('should default to All for the time range', () => {
    cy.get('#time-range-filter').should('have.value', '');
  });

  describe('Workflow Manual Search', () => {
    it('should change url on manual search and update filters and show results count', () => {
      cy.get('#manual-search').type('WorkflowType="ImportantWorkflowType"');
      cy.get('[data-testid="manual-search-button"]').click();

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      cy.url().should('contain', result);

      cy.get('[data-testid="workflow-type-filter-button"]').click();
      cy.get('#workflowType').should('have.value', 'ImportantWorkflowType');

      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });
  });

  describe('Workflow Filters', () => {
    it('should send the correct query for Workflow Type, autocomplete manual search and be clearable', () => {
      cy.get('[data-testid="workflow-type-filter-button"]').click();

      cy.get('#workflowType').type('ImportantWorkflowType');

      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'WorkflowType="ImportantWorkflowType"',
      );

      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );

      cy.get(
        '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
      ).click();

      cy.url().should('not.contain', result);
    });

    it('should send the correct query for Workflow ID, autocomplete manual search and be clearable', () => {
      cy.get('[data-testid="workflow-id-filter-button"]').click();

      cy.get('#workflowId').type('002c98_Running');

      const result = encodeURIComponent('WorkflowId="002c98_Running"');
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'WorkflowId="002c98_Running"',
      );
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );

      cy.get(
        '.px-2 > .input-container > [data-testid="clear-input"] > .icon-button',
      ).click();

      cy.url().should('not.contain', result);
    });

    it('should change url on single Execution Status change', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();

      const result = encodeURIComponent('ExecutionStatus="Running"');
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'ExecutionStatus="Running"',
      );
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });

    it('should change url on multiple Execution Status change', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();
      cy.get('[data-testid="Failed"]').click();

      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        '(ExecutionStatus="Running" OR ExecutionStatus="Failed")',
      );
    });

    it('should clear Execution Status on All', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();
      cy.get('[data-testid="Failed"]').click();

      const result =
        '%28ExecutionStatus%3D%22Running%22+OR+ExecutionStatus%3D%22Failed%22%29';
      cy.url().should('contain', result);

      cy.get('[data-testid="All"]').click();
      cy.url().should('contain.not', result);
    });

    it('should combine all three filters', () => {
      cy.get('[data-testid="execution-status-filter-button"]').click();
      cy.get('[data-testid="Running"]').click();

      cy.get('[data-testid="workflow-id-filter-button"]').click();
      cy.get('#workflowId').type('002c98_Running');

      cy.get('[data-testid="workflow-type-filter-button"]').click();
      cy.get('#workflowType').type('ImportantWorkflowType');

      const result =
        'ExecutionStatus%3D%22Running%22+AND+WorkflowId%3D%22002c98_Running%22+AND+WorkflowType%3D%22ImportantWorkflowType%22';
      cy.url().should('contain', result);
      cy.get('#manual-search').should(
        'have.value',
        'ExecutionStatus="Running" AND WorkflowId="002c98_Running" AND WorkflowType="ImportantWorkflowType"',
      );
    });

    it('should send the correct query for StartTime', () => {
      cy.get('#time-range-filter').click();
      cy.contains('15 minutes').click();

      cy.url().should('contain', 'StartTime+%3E');
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });

    it('should send the correct query for CloseTime', () => {
      cy.get('#time-range-filter').click();
      cy.contains('3 hours').click();
      cy.contains('End Time').click();

      cy.url().should('contain', 'CloseTime+%3E');
      cy.get('[data-testid="workflow-count"]').should(
        'have.text',
        'Results 15 of 15 workflows',
      );
    });

    describe('Workflow Filters with Navigation ', () => {
      beforeEach(() => {
        cy.interceptApi();

        cy.intercept(
          Cypress.env('VITE_API_HOST') +
            `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse*`,
          { fixture: 'event-history-completed.json' },
        ).as('event-history-api');

        cy.intercept(
          Cypress.env('VITE_API_HOST') +
            `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
          { fixture: 'workflow-completed.json' },
        ).as('workflow-api');
      });

      it('should keep single workflow filter after navigating away and back to workflow list', () => {
        cy.get('[data-testid="execution-status-filter-button"]').click();
        cy.get('[data-testid="Running"]').click();
        cy.get('body').click(0, 0); // close the Workflow Status filter dropdown

        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="Running"`),
        );

        cy.get('.workflow-summary-configurable-row').first().click();

        cy.wait('@workflow-api');
        cy.wait('@event-history-api');

        cy.url().should('contain', '/history');
        cy.get('[data-testid="back-to-workflows"]').click();

        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="Running"`),
        );
        cy.get('[data-testid="workflow-count"]').should(
          'have.text',
          'Results 15 of 15 workflows',
        );
      });
    });
  });
});
